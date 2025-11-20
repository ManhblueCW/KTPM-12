import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dbConnect from './utils/dbConnect.js';
import playlistsRoutes from './routes/playlists.js';

const app = express();
const port = process.env.PORT || 3004;

console.log('[Playlist Service] Starting Playlist Service...');

// Connect to database
await dbConnect();

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Routes
app.use('/api/playlists', playlistsRoutes);

// Health check
app.get('/health', (req, res) => {
  console.log('[Playlist Service] Health check requested');
  res.status(200).json({ status: 'healthy', service: 'playlist-service' });
});

app.listen(port, () => {
  console.log(`[Playlist Service] Server listening on port ${port}`);
});