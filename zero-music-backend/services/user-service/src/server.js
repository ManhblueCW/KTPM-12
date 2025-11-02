import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import userRoutes from './routes/users.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', userRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ User Service MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`🚀 User Service running on port ${PORT}`));
