import express from 'express';
import postService from '../services/postService.js';
import { authenticateToken } from '../utils/auth.js';

const router = express.Router();

// GET posts from a user and their followees
router.get('/', authenticateToken, async (req, res) => {
  console.log('[Social Service] GET /api/posts - Request received');
  
  const userId = req.user.id;
  global.currentToken = req.headers['authorization']?.split(' ')[1];

  const result = await postService.getPostsForUser(userId);
  
  if (result.success) {
    console.log('[Social Service] Get posts successful');
    return res.status(result.status).json({ success: true, data: result.data });
  } else {
    console.log('[Social Service] Get posts failed:', result.error);
    return res.status(result.status).json({ success: false, error: result.error });
  }
});

// POST a new post
router.post('/', authenticateToken, async (req, res) => {
  console.log('[Social Service] POST /api/posts - Request received');
  
  const userId = req.user.id;
  const { content, trackId } = req.body;
  
  if (!content) {
    console.log('[Social Service] Content is required');
    return res.status(400).json({ success: false, error: 'Content is required' });
  }

  global.currentToken = req.headers['authorization']?.split(' ')[1];

  const result = await postService.createPost(userId, content, trackId);
  
  if (result.success) {
    console.log('[Social Service] Create post successful');
    return res.status(result.status).json({ success: true, data: result.data });
  } else {
    console.log('[Social Service] Create post failed:', result.error);
    return res.status(result.status).json({ success: false, error: result.error });
  }
});

// DELETE a post
router.delete('/:postId', authenticateToken, async (req, res) => {
  console.log('[Social Service] DELETE /api/posts/:postId - Request received');
  
  const { postId } = req.params;
  const userId = req.user.id;
  
  global.currentToken = req.headers['authorization']?.split(' ')[1];

  const result = await postService.deletePost(postId, userId);
  
  if (result.success) {
    console.log('[Social Service] Delete post successful');
    return res.status(result.status).json({ success: true, message: result.message });
  } else {
    console.log('[Social Service] Delete post failed:', result.error);
    return res.status(result.status).json({ success: false, error: result.error });
  }
});

export default router;