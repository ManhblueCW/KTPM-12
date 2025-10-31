import express from 'express';
import * as postService from '../services/postService.js';
import { authenticateToken } from '../utils/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const posts = await postService.getFeed(req.user.id);
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const post = await postService.createPost(req.user.id, req.body.content, req.body.trackId);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:postId', authenticateToken, async (req, res) => {
  try {
    await postService.deletePost(req.user.id, req.params.postId);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
