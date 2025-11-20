import express from 'express';
import authService from '../services/authService.js';
import { handleFormidable } from '../utils/file.js';
import { authenticateToken } from '../utils/auth.js';

const router = express.Router();

// Get user info
router.get('/:userId', authenticateToken, async (req, res) => {
  console.log('[Auth Service] GET /api/users/:userId - Request received');
  
  let userId = req.params.userId;
  if (userId === 'current') {
    userId = req.user.id;
  }

  const result = await authService.getUserById(userId);
  
  if (result.success) {
    console.log('[Auth Service] Get user info successful');
    
    // Populate if requested
    if (req.query.populate) {
      console.log('[Auth Service] Populating:', req.query.populate);
      await result.data.populate(req.query.populate);
    }
    
    return res.status(result.status).json(result.data);
  } else {
    console.log('[Auth Service] Get user info failed:', result.error);
    return res.status(result.status).json({ success: false, message: result.error });
  }
});

// POST to register a new user
router.post('/', handleFormidable, async (req, res) => {
  console.log('[Auth Service] POST /api/users - Register request received');
  
  const { fields, files } = req;
  const username = fields.username[0];
  const password = fields.password[0];
  const name = fields.name[0];
  const useDefaultAvatar = fields.useDefaultAvatar[0] === 'true';

  if (!username || !password) {
    console.log('[Auth Service] Missing username or password');
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const userData = {
    username,
    password,
    name,
    useDefaultAvatar
  };

  const avatarFile = files.avatar ? (Array.isArray(files.avatar) ? files.avatar[0] : files.avatar) : null;

  const result = await authService.register(userData, avatarFile);
  
  if (result.success) {
    console.log('[Auth Service] Registration successful');
    return res.status(result.status).json({ message: result.message });
  } else {
    console.log('[Auth Service] Registration failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// PUT to update user info
router.put('/', [authenticateToken, handleFormidable], async (req, res) => {
  console.log('[Auth Service] PUT /api/users - Update user request received');
  
  const userId = req.user.id;
  const { fields, files } = req;
  const username = fields.username[0];
  const password = fields.password[0];
  const name = fields.name[0];
  const useDefaultAvatar = fields.useDefaultAvatar[0] === 'true';

  if (!username || !password) {
    console.log('[Auth Service] Missing username or password');
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const userData = {
    username,
    password,
    name,
    useDefaultAvatar
  };

  const avatarFile = files.avatar ? (Array.isArray(files.avatar) ? files.avatar[0] : files.avatar) : null;

  const result = await authService.updateUser(userId, userData, avatarFile);
  
  if (result.success) {
    console.log('[Auth Service] Update successful');
    return res.status(result.status).json({
      message: result.message,
      user: result.data
    });
  } else {
    console.log('[Auth Service] Update failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

export default router;