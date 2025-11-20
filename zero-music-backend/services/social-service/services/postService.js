import Post from '../models/Post.js';
import mongoose from 'mongoose';
import axios from 'axios';

class PostService {
  async getPostsForUser(userId) {
  console.log('[Social Service] Getting posts for user:', userId);

  try {
    // Lấy thông tin user từ User Service
    const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${global.currentToken}`
      }
    });

    console.log('[Social Service] User Service response:', response.data);

    const user = response.data?.data || response.data;
    const followingIds = Array.isArray(user?.following) ? user.following : [];
    followingIds.push(userId);

    console.log('[Social Service] Getting posts from', followingIds.length, 'users');

    const posts = await Post.find({ userId: { $in: followingIds } })
      .sort({ timestamp: -1 })
      .lean();

    if (posts.length === 0) return { success: true, data: [], status: 200 };

    // Lấy thông tin user của các post
    const uniqueUserIds = [...new Set(posts.map(p => p.userId.toString()))];

    const responseBatch = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/users/batch`,
      { ids: uniqueUserIds },
      { headers: { 'Authorization': `Bearer ${global.currentToken}` } }
    );

    const users = responseBatch.data.users || [];
    const usersMap = new Map(users.map(u => [u._id, u]));

    const postsWithUser = posts.map(post => ({
      ...post,
      user: usersMap.get(post.userId.toString())
    }));

    return { success: true, data: postsWithUser, status: 200 };
  } catch (error) {
    console.error('[Social Service] Error getting posts:', error.message);
    return { success: false, error: 'Failed to retrieve posts', status: 400 };
  }
}


  async createPost(userId, content, trackId) {
    console.log('[Social Service] Creating post for user:', userId);
    
    try {
      const post = new Post({
        userId,
        content,
        timestamp: new Date(),
        trackId: trackId ? new mongoose.Types.ObjectId(trackId) : undefined
      });

      await post.save();
      console.log('[Social Service] Post created:', post._id);

      // Update user's posts in User Service
      try {
        console.log('[Social Service] Updating user posts in User Service');
        await axios.post(`${process.env.USER_SERVICE_URL}/api/users/${userId}/posts/add`, {
          postId: post._id.toString()
        }, {
          headers: {
            'Authorization': `Bearer ${global.currentToken}`
          }
        });
        console.log('[Social Service] User posts updated');
      } catch (error) {
        console.error('[Social Service] Error updating user posts:', error.message);
      }

      return { success: true, data: post, status: 201 };
    } catch (error) {
      console.error('[Social Service] Error creating post:', error);
      return { success: false, error: 'Failed to create post', status: 400 };
    }
  }

  async deletePost(postId, userId) {
    console.log('[Social Service] Deleting post:', postId);
    
    try {
      const post = await Post.findById(postId);
      
      if (!post) {
        console.log('[Social Service] Post not found:', postId);
        return { success: false, error: 'Post not found', status: 404 };
      }

      // Check if user owns the post
      if (post.userId.toString() !== userId) {
        console.log('[Social Service] User', userId, 'does not own post', postId);
        return { success: false, error: 'Unauthorized', status: 403 };
      }

      await Post.findByIdAndDelete(postId);
      console.log('[Social Service] Post deleted from database');

      // Update user's posts in User Service
      try {
        console.log('[Social Service] Removing post from user in User Service');
        await axios.post(`${process.env.USER_SERVICE_URL}/api/users/${userId}/posts/remove`, {
          postId: postId
        }, {
          headers: {
            'Authorization': `Bearer ${global.currentToken}`
          }
        });
        console.log('[Social Service] Post removed from user');
      } catch (error) {
        console.error('[Social Service] Error removing post from user:', error.message);
      }

      return { success: true, status: 200, message: 'Post deleted successfully' };
    } catch (error) {
      console.error('[Social Service] Error deleting post:', error);
      return { success: false, error: 'Failed to delete post', status: 400 };
    }
  }
}

export default new PostService();