import express from 'express';
import messageService from '../services/messageService.js';
import { authenticateToken } from '../utils/auth.js';

const router = express.Router();

// GET all chat partners for a user
router.get('/', authenticateToken, async (req, res) => {
  console.log('[Social Service] GET /api/messages - Request received');
  
  const userId = req.user.id;
  global.currentToken = req.headers['authorization']?.split(' ')[1];

  const result = await messageService.getChatList(userId);
  
  if (result.success) {
    console.log('[Social Service] Get chat list successful');
    return res.status(result.status).json({ 
      success: true, 
      userAvatar: result.data.userAvatar, 
      data: result.data.chatListData 
    });
  } else {
    console.log('[Social Service] Get chat list failed:', result.error);
    return res.status(result.status).json({ success: false, error: result.error });
  }
});

// GET all messages between two users
router.get('/:userId', authenticateToken, async (req, res) => {
  console.log('[Social Service] GET /api/messages/:userId - Request received');
  
  const userId = req.user.id;
  const { userId: partnerId } = req.params;

  const result = await messageService.getMessagesBetweenUsers(userId, partnerId);
  
  if (result.success) {
    console.log('[Social Service] Get messages successful');
    return res.status(result.status).json({ success: true, data: result.data });
  } else {
    console.log('[Social Service] Get messages failed:', result.error);
    return res.status(result.status).json({ success: false, error: result.error });
  }
});

export default router;