import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import userRoutes from './routes/users.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', userRoutes);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('User Service MongoDB connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
