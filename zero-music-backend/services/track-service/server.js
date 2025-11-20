import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dbConnect from './utils/dbConnect.js';
import tracksRoutes from './routes/tracks.js';

const app = express();
const port = process.env.PORT || 3003;

console.log('[Track Service] Starting Track Service...');

// Connect to database
await dbConnect();

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Routes
app.use('/api/tracks', tracksRoutes);

// Health check
app.get('/health', (req, res) => {
  console.log('[Track Service] Health check requested');
  res.status(200).json({ status: 'healthy', service: 'track-service' });
});

app.listen(port, () => {
  console.log(`[Track Service] Server listening on port ${port}`);
});