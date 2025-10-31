import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import postRoutes from './routes/posts.js';

const app = express();

app.use(express.json());
app.use('/posts', postRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Post service connected to MongoDB');
    const PORT = process.env.PORT || 5002;
    app.listen(PORT, () => console.log(`Post service running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
