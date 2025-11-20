import express from 'express';
import Message from '../models/Message.js';
import { extractUser } from '../middleware/extractUser.js';
import * as messageService from '../services/messageService.js';

const router = express.Router();

// GET all chat partners for a user
router.get('/', extractUser, async (req, res) => {
  const userId = req.user.id;
  console.log('💬 [Message Service] GET chat partners for user:', userId);
  
  try {
    // Get user info
    const user = await messageService.getUserInfo(userId);
    const userAvatar = user?.avatar;

    // Retrieve messages
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).lean();

    console.log(`📨 [Message Service] Found ${messages.length} messages`);

    // Get unique chat partners
    const uniqueChatPartners = new Set();
    const chatListData = [];

    for (const message of messages) {
      const partnerId = message.senderId.toString() === userId 
        ? message.receiverId.toString() 
        : message.senderId.toString();

      if (!uniqueChatPartners.has(partnerId)) {
        uniqueChatPartners.add(partnerId);
        
        // Get partner info from User Service
        const partnerInfo = await messageService.getUserInfo(partnerId);
        if (partnerInfo) {
          chatListData.push({
            partnerId,
            partnerName: partnerInfo.name,
            partnerAvatar: partnerInfo.avatar
          });
        }
      }
    }

    console.log(`✅ [Message Service] Retrieved ${chatListData.length} chat partners`);
    res.status(200).json({ success: true, userAvatar, data: chatListData });
  } catch (error) {
    console.error('❌ [Message Service] Error retrieving chat data:', error);
    res.status(400).json({ success: false, error: 'Failed to fetch chat data' });
  }
});

// GET all messages between two users
router.get('/:userId', extractUser, async (req, res) => {
  const userId = req.user.id;
  const { userId: partnerId } = req.params;
  console.log(`💬 [Message Service] GET messages between ${userId} and ${partnerId}`);

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId }
      ]
    }).sort({ timestamp: 1 });
    
    console.log(`✅ [Message Service] Retrieved ${messages.length} messages`);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('❌ [Message Service] Error retrieving messages:', error);
    res.status(400).json({ success: false, error: 'Failed to retrieve messages' });
  }
});

export default router;