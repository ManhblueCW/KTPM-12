import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dbConnect from './utils/dbConnect.js';
import usersRoutes from './routes/users.js';

const app = express();
const port = process.env.PORT || 3002;

console.log('[User Service] Starting User Service...');

// Connect to database
await dbConnect();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRoutes);

// Health check
app.get('/health', (req, res) => {
  console.log('[User Service] Health check requested');
  res.status(200).json({ status: 'healthy', service: 'user-service' });
});

app.listen(port, () => {
  console.log(`[User Service] Server listening on port ${port}`);
});