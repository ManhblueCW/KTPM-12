import express from 'express';
import axios from 'axios';
import { getChatPartners, getMessagesBetweenUsers, sendMessage } from '../services/messageService.js';
import 'dotenv/config';

const router = express.Router();

// GET all chat partners
router.get('/', async (req, res) => {
  const userId = req.user.id;
  try {
    const chatListData = await getChatPartners(userId);

    // Optionally call Auth service to get avatar of current user
    const userResp = await axios.get(`${process.env.AUTH_SERVICE_URL}/user/${userId}`);
    const userAvatar = userResp.data.user.avatar;

    res.status(200).json({ success: true, userAvatar, data: chatListData });
  } catch (error) {
    console.error('Error retrieving chat data:', error);
    res.status(400).json({ success: false, error: 'Failed to fetch chat data' });
  }
});

// GET messages with a partner
router.get('/:partnerId', async (req, res) => {
  const userId = req.user.id;
  const { partnerId } = req.params;

  try {
    const messages = await getMessagesBetweenUsers(userId, partnerId);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Failed to retrieve messages:', error);
    res.status(400).json({ success: false, error: 'Failed to retrieve messages' });
  }
});

// POST send message
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const { receiverId, message } = req.body;

  if (!receiverId || !message) return res.status(400).json({ error: "Missing fields" });

  try {
    const newMessage = await sendMessage(userId, receiverId, message);
    res.status(201).json({ success: true, message: "Message sent", data: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
});

export default router;
