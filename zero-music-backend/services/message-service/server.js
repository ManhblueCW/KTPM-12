import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dbConnect from './utils/dbConnect.js';
import messagesRouter from './routes/messages.js';
import Message from './models/Message.js';
import * as messageService from './services/messageService.js';

dotenv.config();
await dbConnect();

const app = express();
const PORT = process.env.PORT || 3005;

console.log('🚀 [Message Service] Starting...');

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`🔌 [Message Service] Socket connected for user: ${userId}`);
  socket.join(userId);

  socket.on('privateMessage', async ({ senderId, receiverId, message }) => {
    console.log(`💬 [Message Service] Private message from ${senderId} to ${receiverId}`);
    try {
      const savedMessage = await messageService.saveMessage(Message, senderId, receiverId, message);
      socket.to(receiverId).emit('newMessage', { 
        senderId, 
        message,
        messageId: savedMessage._id,
        timestamp: savedMessage.timestamp
      });
      console.log('✅ [Message Service] Message sent and saved');
    } catch (error) {
      console.error('❌ [Message Service] Error in privateMessage:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Message Service] Socket disconnected for user: ${userId}`);
    socket.leave(userId);
  });
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  console.log('💓 [Message Service] Health check');
  res.json({ status: 'OK', service: 'Message Service' });
});

app.use('/api/messages', messagesRouter);

server.listen(PORT, () => {
  console.log(`✅ [Message Service] Running on port ${PORT} with Socket.IO`);
});