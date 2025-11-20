import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dbConnect from './utils/dbConnect.js';
import searchRoutes from './routes/search.js';

const app = express();
const port = process.env.PORT || 3008;

console.log('[Search Service] Starting Search Service...');

// Connect to database
await dbConnect();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/search', searchRoutes);

// Health check
app.get('/health', (req, res) => {
  console.log('[Search Service] Health check requested');
  res.status(200).json({ status: 'healthy', service: 'search-service' });
});

app.listen(port, () => {
  console.log(`[Search Service] Server listening on port ${port}`);
});