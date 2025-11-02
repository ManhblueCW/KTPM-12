import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import 'dotenv/config';
import { authenticateToken } from './utils/auth.js';

const app = express();
app.use(cors());

// ======== Service mapping ========
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  music: process.env.MUSIC_SERVICE_URL || 'http://localhost:4002',
  post: process.env.POST_SERVICE_URL || 'http://localhost:4003',
  message: process.env.MESSAGE_SERVICE_URL || 'http://localhost:4004',
  user: process.env.USER_SERVICE_URL || 'http://localhost:4005',
};

// ✅ Auth Service (login, register, verify)
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: SERVICES.auth,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' },
    logLevel: 'debug', // 👈 thêm dòng này
    onError: (err, req, res) => {
      console.error('[Gateway Error]', err.message);
      res.status(500).json({ error: 'Gateway cannot reach Auth service' });
    },
  })
);


const PORT = process.env.PORT || 4000;

// Logging middleware
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.originalUrl}`);
  next();
});





// ======== Proxy routes ========





// 🎵 Music Service (tracks, playlists, drive, favorites)
app.use('/api/music', authenticateToken, createProxyMiddleware({
  target: SERVICES.music,
  changeOrigin: true,
  bodyParser: false,
  pathRewrite: { '^/api/music': '' },
  logLevel: 'debug'
}));

// 📝 Post Service
app.use('/api/posts', authenticateToken, createProxyMiddleware({
  target: SERVICES.post,
  changeOrigin: true,
  pathRewrite: { '^/api/posts': '' },
}));

// 💬 Message Service
app.use('/api/messages', authenticateToken, createProxyMiddleware({
  target: SERVICES.message,
  changeOrigin: true,
  pathRewrite: { '^/api/messages': '' },
}));

// 👤 User Service
app.use('/api/users', authenticateToken, createProxyMiddleware({
  target: SERVICES.user,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '' },
}));

// ======== Default route ========
app.get('/', (req, res) => {
  res.send('🎧 ZeroMusic API Gateway is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Gateway running on port ${PORT}`);
  console.table(SERVICES);
});


app.use(express.json());