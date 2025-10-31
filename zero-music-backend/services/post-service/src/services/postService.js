import Post from '../models/Post.js';
import axios from 'axios';

export async function getFeed(userId) {
  // Lấy danh sách following từ Auth service
  const authResp = await axios.get(`${process.env.AUTH_SERVICE_URL}/user/${userId}`);
  const following = authResp.data.user.following || [];
  following.push(userId);

  const posts = await Post.find({ userId: { $in: following } })
    .sort({ timestamp: -1 })
    .lean();

  // Lấy user info và track info từ các service tương ứng
  for (let post of posts) {
    // User info
    try {
      const userResp = await axios.get(`${process.env.AUTH_SERVICE_URL}/user/${post.userId}`);
      post.user = { id: post.userId, name: userResp.data.user.name, avatar: userResp.data.user.avatar };
    } catch {
      post.user = { id: post.userId, name: 'Unknown', avatar: '' };
    }

    // Track info
    if (post.trackId) {
      try {
        const trackResp = await axios.get(`${process.env.MUSIC_SERVICE_URL}/tracks/${post.trackId}`);
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
