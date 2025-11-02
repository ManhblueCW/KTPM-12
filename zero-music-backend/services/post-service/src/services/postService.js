import Post from '../models/Post.js';
import axios from 'axios';

export async function getFeed(userId, token) {
  const userServiceUrl = process.env.USER_SERVICE_URL;
  const musicServiceUrl = process.env.MUSIC_SERVICE_URL;

  console.log('User Service URL:', userServiceUrl);
  let following = [];

  // --- Lấy danh sách following từ User Service ---
  try {
    const userResp = await axios.get(`${userServiceUrl}/${userId}`, {
      headers: {
        Authorization: token, // 👈 forward token FE gửi
      },
    });

    following = userResp.data?.user?.following || [];
    following.push(userId);
    console.log('Following list:', following);
  } catch (err) {
    console.error('[PostService] Failed to fetch following list:', err.message);
    console.error('Response data:', err.response?.data);
    throw new Error(`Cannot get following list: ${err.message}`);
  }

  // --- Lấy post ---
  const posts = await Post.find({ userId: { $in: following } })
    .sort({ timestamp: -1 })
    .lean();

  // --- Bổ sung thông tin user và bài nhạc ---
  for (let post of posts) {
    // Thông tin user
    try {
      const userData = await axios.get(`${userServiceUrl}/${post.userId}`, {
        headers: { Authorization: token }, // 👈 forward token
      });
      post.user = userData.data?.user || { name: 'Unknown', avatar: '' };
    } catch {
      post.user = { name: 'Unknown', avatar: '' };
    }

    // Thông tin track
    if (post.trackId) {
      try {
        const trackResp = await axios.get(`${musicServiceUrl}/tracks/${post.trackId}`, {
          headers: { Authorization: token }, // 👈 forward token
        });
        post.track = trackResp.data;
      } catch {
        post.track = null;
      }
    }
  }

  return posts;
}

export async function createPost(userId, content, trackId) {
  const post = new Post({ userId, content, trackId });
  await post.save();
  return post;
}

export async function deletePost(userId, postId) {
  const post = await Post.findById(postId);
  if (!post) throw new Error('Post not found');
  if (post.userId !== userId) throw new Error('Not authorized');
  await Post.findByIdAndDelete(postId);
}
