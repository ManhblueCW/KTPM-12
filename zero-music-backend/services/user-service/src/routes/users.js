import express from 'express';
import * as userService from '../services/userService.js';
import { authMiddleware } from '../utils/authMiddleware.js';
import { handleFormidable } from '../utils/file.js';

const router = express.Router();

// Register
router.post('/', handleFormidable, async (req, res) => {
  try {
    const user = await userService.registerUser({
      username: req.fields.username[0],
      name: req.fields.name[0],
      password: req.fields.password[0],
      avatarFile: req.files.avatar,
      useDefaultAvatar: req.fields.useDefaultAvatar?.[0] === 'true'
    });
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Update
router.put('/:id', authMiddleware, handleFormidable, async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, {
      username: req.fields.username?.[0],
      name: req.fields.name?.[0],
      password: req.fields.password?.[0],
      avatarFile: req.files.avatar,
      useDefaultAvatar: req.fields.useDefaultAvatar?.[0] === 'true'
    });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Follow
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    await userService.followUser(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Unfollow
router.delete('/:id/follow', authMiddleware, async (req, res) => {
  try {
    await userService.unfollowUser(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Get following
router.get('/:id/following', authMiddleware, async (req, res) => {
  try {
    const following = await userService.getFollowing(req.params.id);
    res.json({ success: true, following });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Get followers
router.get('/:id/followers', authMiddleware, async (req, res) => {
  try {
    const followers = await userService.getFollowers(req.params.id);
    res.json({ success: true, followers });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Get user info
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
