import express from 'express';
import mongoose from 'mongoose';
import messageRoutes from './routes/message.js';
import { authenticateToken } from './utils/authMiddleware.js';
import 'dotenv/config';

const app = express();
app.use(express.json());

// DB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Message DB connected"))
.catch(err => console.error("Message DB connection error:", err));

// Routes
app.use('/', authenticateToken, messageRoutes);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Message service running on port ${PORT}`));
