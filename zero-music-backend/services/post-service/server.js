import express from 'express';
import dotenv from 'dotenv';
import dbConnect from './utils/dbConnect.js';
import postsRouter from './routes/posts.js';

dotenv.config();
await dbConnect();

const app = express();
const PORT = process.env.PORT || 3006;

console.log('🚀 [Post Service] Starting...');

app.use(express.json());

app.get('/health', (req, res) => {
  console.log('💓 [Post Service] Health check');
  res.json({ status: 'OK', service: 'Post Service' });
});

app.use('/api/posts', postsRouter);

app.listen(PORT, () => {
  console.log(`✅ [Post Service] Running on port ${PORT}`);
});