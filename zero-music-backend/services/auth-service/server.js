import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dbConnect from './utils/dbConnect.js';
import loginRoutes from './routes/login.js';
import usersRoutes from './routes/users.js';

const app = express();
const port = process.env.PORT || 3001;

console.log('[Auth Service] Starting Auth Service...');

// Connect to database
await dbConnect();

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Routes
app.use('/api/login', loginRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/health', (req, res) => {
  console.log('[Auth Service] Health check requested');
  res.status(200).json({ status: 'healthy', service: 'auth-service' });
});

app.listen(port, () => {
  console.log(`[Auth Service] Server listening on port ${port}`);
});