import express from 'express';
import formidable from 'formidable';
import * as userService from '../services/userService.js';
import { authenticateToken } from '../utils/authMiddleware.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { handleFormidableAsync } from '../utils/file.js'; // ⬅️ Import hàm này

const router = express.Router();

// Middleware parse form-data
function handleForm(req, res, next) {
  const form = formidable({ keepExtensions: true, multiples: false });
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(400).json({ error: err.message });
    req.fields = fields;
    req.files = files;
    next();
  });
}

router.post("/create", async (req, res) => {
  try {
    const { userId, username, name, avatar } = req.body;
    const objectId = new mongoose.Types.ObjectId(userId);
    const existing = await User.findById(objectId);
    if (existing) return res.json({ success: false, message: "User already exists" });

    const user = await User.create({
      _id: objectId,
      username,
      name,
      avatar,
    });

    res.json({ success: true, user });
  } catch (err) {
    console.error('[User-Service POST /create Error]', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// Update user info
router.put('/:id', authenticateToken, async (req, res) => { // ⬅️ Xóa handleForm khỏi middleware
  try {
    // ➡️ Thực hiện parsing Formidable ở đây
    const { fields, files } = await handleFormidableAsync(req); 
    
    // Trích xuất file như cũ, sử dụng 'files' đã parse
    const avatarFile = Array.isArray(files.avatar) 
      ? files.avatar[0] 
      : files.avatar;

    const user = await userService.updateUser(req.params.id, {
      username: fields.username?.[0], // ⬅️ Dùng 'fields' đã parse
      name: fields.name?.[0],        // ⬅️ Dùng 'fields' đã parse
      avatarFile: avatarFile, 
      useDefaultAvatar: fields.useDefaultAvatar?.[0] === 'true'
    });
    
    // ... (logic phản hồi)
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('[User-Service PUT /:id Error]', err.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Follow / Unfollow
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    await userService.followUser(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:id/follow', authenticateToken, async (req, res) => {
  try {
    await userService.unfollowUser(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Get following / followers
router.get('/:id/following', authenticateToken, async (req, res) => {
  try {
    const following = await userService.getFollowing(req.params.id);
    res.json({ success: true, following });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/:id/followers', authenticateToken, async (req, res) => {
  try {
    const followers = await userService.getFollowers(req.params.id);
    res.json({ success: true, followers });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Get user info
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
