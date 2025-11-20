import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { requestLogger } from './middleware/logger.js';
import { authenticateToken, optionalAuth } from './middleware/auth.js';
import { createServiceProxy } from './utils/proxy.js';

const app = express();
const port = process.env.PORT || 3000;

console.log('[API Gateway] Starting API Gateway...');
console.log('[API Gateway] Environment:', process.env.NODE_ENV);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Service URLs
const services = {
  auth: process.env.AUTH_SERVICE_URL,
  user: process.env.USER_SERVICE_URL,
  track: process.env.TRACK_SERVICE_URL,
  playlist: process.env.PLAYLIST_SERVICE_URL,
  drive: process.env.DRIVE_SERVICE_URL,
  favorites: process.env.FAVORITES_SERVICE_URL,
  social: process.env.SOCIAL_SERVICE_URL,
  search: process.env.SEARCH_SERVICE_URL
};

console.log('[API Gateway] Service configuration:');
Object.entries(services).forEach(([name, url]) => {
  console.log(`[API Gateway] ${name}: ${url}`);
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('[API Gateway] Health check requested');
  res.status(200).json({ 
    status: 'healthy', 
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: services
  });
});

// Auth Service routes
console.log('[API Gateway] Setting up Auth Service routes');
app.use('/api/login', createServiceProxy(services.auth, {
  logLevel: 'debug',
  pathRewrite: (path, req) => {
    console.log('[API Gateway] Rewriting path:', path, '-> /api/login');
    return '/api/login';
  }
}));

// User Service routes
console.log('[API Gateway] Setting up User Service routes');
// Register (POST /api/users) - handled by Auth Service
app.use('/api/users', (req, res, next) => {
  if (req.method === 'POST' && !req.headers.authorization) {
    // This is a registration request
    console.log('[API Gateway] Routing registration to Auth Service');
    return createServiceProxy(services.auth)(req, res, next);
  } else if (req.method === 'PUT' && req.headers.authorization) {
    // This is an update request
    console.log('[API Gateway] Routing update to Auth Service');
    return authenticateToken(req, res, () => {
      createServiceProxy(services.auth)(req, res, next);
    });
  } else {
    // Other user routes go to User Service
    console.log('[API Gateway] Routing to User Service');
    return authenticateToken(req, res, () => {
      createServiceProxy(services.user)(req, res, next);
    });
  }
});

// Track Service routes
console.log('[API Gateway] Setting up Track Service routes');
app.use('/api/tracks', (req, res, next) => {
  if (req.method === 'GET' && !req.params.trackId) {
    // GET all tracks - optional auth
    return optionalAuth(req, res, () => {
      createServiceProxy(services.track)(req, res, next);
    });
  } else {
    // Other track routes
    return createServiceProxy(services.track)(req, res, next);
  }
});

// Playlist Service routes
console.log('[API Gateway] Setting up Playlist Service routes');
app.use('/api/playlists', authenticateToken, createServiceProxy(services.playlist));

// Drive Service routes
console.log('[API Gateway] Setting up Drive Service routes');
app.use('/api/drive', authenticateToken, createServiceProxy(services.drive));

// Favorites Service routes
console.log('[API Gateway] Setting up Favorites Service routes');
app.use('/api/favorites', authenticateToken, createServiceProxy(services.favorites));

// Social Service routes
console.log('[API Gateway] Setting up Social Service routes');
app.use('/api/posts', authenticateToken, createServiceProxy(services.social));
app.use('/api/messages', authenticateToken, createServiceProxy(services.social));

// Search Service routes
console.log('[API Gateway] Setting up Search Service routes');
app.use('/api/search', createServiceProxy(services.search));

// Static files (for uploaded files)
app.use(express.static('public'));
console.log('[API Gateway] Static files served from public directory');

// 404 handler
app.use((req, res) => {
  console.log('[API Gateway] 404 - Route not found:', req.originalUrl);
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[API Gateway] Error occurred:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(port, () => {
  console.log(`[API Gateway] Server listening on port ${port}`);
  console.log(`[API Gateway] All requests will be proxied to respective services`);
  console.log(`[API Gateway] Client URL: ${process.env.CLIENT_URL}`);
});