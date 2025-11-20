import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import Post from '../models/Post.js';
import { extractUser } from '../middleware/extractUser.js';
import * as postService from '../services/postService.js';

const router = express.Router();

// Internal route - get posts by user ID
router.get('/internal/posts/user/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log('🔒 [Post Service] Internal: GET posts for user:', userId);
  
  try {
    const posts = await Post.find({ userId })
      .sort({ timestamp: -1 })
      .lean();
    
    const enrichedPosts = await postService.enrichPostsWithDetails(posts);
    console.log(`✅ [Post Service] Retrieved ${enrichedPosts.length} posts`);
    res.status(200).json(enrichedPosts);
  } catch (error) {
    console.error('❌ [Post Service] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET posts from a user and their followees
router.get('/', extractUser, async (req, res) => {
  const userId = req.user.id;
  console.log('📰 [Post Service] GET feed for user:', userId);
  
  try {
    // Get user's following list from User Service
    console.log('📡 [Post Service] Fetching following list from User Service...');
    const userResponse = await axios.get(
      `${process.env.USER_SERVICE_URL}/internal/users/${userId}`
    );
    
    const followingIds = userResponse.data.following || [];
    const userIdsToFetch = [userId, ...followingIds.map(id => id.toString())];
    
    console.log(`📡 [Post Service] Fetching posts for ${userIdsToFetch.length} users`);
    const posts = await Post.find({ userId: { $in: userIdsToFetch } })
      .sort({ timestamp: -1 })
      .lean();
    
    console.log(`📝 [Post Service] Found ${posts.length} posts`);
    const enrichedPosts = await postService.enrichPostsWithDetails(posts);
    
    console.log('✅ [Post Service] Feed retrieved');
    res.status(200).json({ success: true, data: enrichedPosts });
  } catch (error) {
    console.error('❌ [Post Service] Error retrieving posts:', error);
    res.status(400).json({ success: false, error: 'Failed to retrieve posts' });
  }
});

// POST a new post
router.post('/', extractUser, async (req, res) => {
  const userId = req.user.id;
  console.log('➕ [Post Service] CREATE post for user:', userId);
  
  try {
    const { content, trackId } = req.body;
    const post = new Post({
      userId,
      content,
      timestamp: new Date(),
      trackId: trackId ? new mongoose.Types.ObjectId(trackId) : undefined
    });

    await post.save();
    
    // Update user's posts in User Service
    console.log('📡 [Post Service] Updating user posts in User Service...');
    await axios.post(
      `${process.env.USER_SERVICE_URL}/internal/users/${userId}/posts`,
      { postId: post._id.toString() }
    );

    console.log('✅ [Post Service] Post created:', post._id);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('❌ [Post Service] Error creating post:', error);
    res.status(400).json({ success: false, error: 'Failed to create post' });
  }
});

// DELETE a post
router.delete('/:postId', extractUser, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;
  console.log(`🗑️  [Post Service] DELETE post ${postId} by user ${userId}`);

  try {
    const post = await Post.findById(postId);
    if (!post) {
      console.log('❌ [Post Service] Post not found');
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (post.userId.toString() !== userId) {
      console.log('❌ [Post Service] Forbidden - user does not own post');
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await Post.findByIdAndDelete(postId);
    
    // Remove from user's posts in User Service
    console.log('📡 [Post Service] Removing from user posts in User Service...');
    await axios.delete(
      `${process.env.USER_SERVICE_URL}/internal/users/${userId}/posts/${postId}`
    );

    console.log('✅ [Post Service] Post deleted');
    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('❌ [Post Service] Error deleting post:', error);
    res.status(400).json({ success: false, error: 'Failed to delete post' });
  }
});

export default router;