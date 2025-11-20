import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dbConnect from './utils/dbConnect.js';
import driveRoutes from './routes/drive.js';

const app = express();
const port = process.env.PORT || 3005;

console.log('[Drive Service] Starting Drive Service...');

// Connect to database
await dbConnect();

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Routes
app.use('/api/drive', driveRoutes);

// Health check
app.get('/health', (req, res) => {
  console.log('[Drive Service] Health check requested');
  res.status(200).json({ status: 'healthy', service: 'drive-service' });
});

app.listen(port, () => {
  console.log(`[Drive Service] Server listening on port ${port}`);
});