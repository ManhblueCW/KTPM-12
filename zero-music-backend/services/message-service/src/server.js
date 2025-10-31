import express from 'express';
import mongoose from 'mongoose';
import messageRoutes from './routes/message.js';
import { authMiddleware } from './utils/authMiddleware.js';
import 'dotenv/config';

const app = express();
app.use(express.json());

// DB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Message DB connected"))
.catch(err => console.error("Message DB connection error:", err));

// Routes
app.use('/messages', authMiddleware, messageRoutes);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Message service running on port ${PORT}`));
