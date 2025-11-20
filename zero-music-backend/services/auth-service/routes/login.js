import express from 'express';
import authService from '../services/authService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  console.log('[Auth Service] POST /api/login - Request received');
  console.log('[Auth Service] Request body:', req.body);
  
  const { username, password } = req.body;
  
  if (!username || !password) {
    console.log('[Auth Service] Missing username or password');
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const result = await authService.login(username, password);
  
  console.log('[Auth Service] Login result:', result);
  
  if (result.success) {
    console.log('[Auth Service] Login successful, sending response');
    // Trả về đúng format như backend cũ
    return res.status(result.status).json({
      token: result.data.token,
      userId: result.data.userId,
      name: result.data.name,
      avatar: result.data.avatar,
      role: result.data.role
    });
  } else {
    console.log('[Auth Service] Login failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

export default router;