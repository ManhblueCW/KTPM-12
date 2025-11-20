import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dbConnect from './utils/dbConnect.js';
import favoritesRoutes from './routes/favorites.js';

const app = express();
const port = process.env.PORT || 3006;

console.log('[Favorites Service] Starting Favorites Service...');

// Connect to database
await dbConnect();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/favorites', favoritesRoutes);

// Health check
app.get('/health', (req, res) => {
  console.log('[Favorites Service] Health check requested');
  res.status(200).json({ status: 'healthy', service: 'favorite-service' });
});

app.listen(port, () => {
  console.log(`[Favorites Service] Server listening on port ${port}`);
});