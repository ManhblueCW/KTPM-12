import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dbConnect from './utils/dbConnect.js';
import postsRoutes from './routes/posts.js';
import messagesRoutes from './routes/messages.js';
import { sendMessage } from './utils/userUtils.js';

const app = express();
const port = process.env.PORT || 3007;

console.log('[Social Service] Starting Social Service...');

// Connect to database
await dbConnect();

// Create HTTP server
const server = createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

console.log('[Social Service] Socket.IO configured with origin:', process.env.CLIENT_URL);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('[Social Service] New socket connection:', socket.id);
  
  const userId = socket.handshake.query.userId;
  console.log('[Social Service] User joined:', userId);
  socket.join(userId);

  socket.on('privateMessage', async ({ senderId, receiverId, message }) => {
    console.log('[Social Service] Private message received');
    console.log('[Social Service] From:', senderId, 'To:', receiverId);
    
    await sendMessage(senderId, receiverId, message);
    
    console.log('[Social Service] Emitting message to receiver:', receiverId);
    socket.to(receiverId).emit('newMessage', { senderId, message });
  });

  socket.on('disconnect', () => {
    console.log('[Social Service] Socket disconnected:', socket.id);
    console.log('[Social Service] User left:', userId);
    socket.leave(userId);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/posts', postsRoutes);
app.use('/api/messages', messagesRoutes);

// Health check
app.get('/health', (req, res) => {
  console.log('[Social Service] Health check requested');
  res.status(200).json({ status: 'healthy', service: 'social-service' });
});

server.listen(port, () => {
  console.log(`[Social Service] Server listening on port ${port}`);
  console.log(`[Social Service] Socket.IO enabled`);
});