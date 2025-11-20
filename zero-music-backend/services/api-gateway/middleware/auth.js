import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secretKey = process.env.JWT_SECRET_KEY;

export const authenticateToken = (req, res, next) => {
  console.log('[API Gateway] Authenticating token for route:', req.originalUrl);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('[API Gateway] No token provided');
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.error('[API Gateway] Token verification failed:', err.message);
      return res.sendStatus(401);
    }
    console.log('[API Gateway] Token verified for user:', user.id);
    req.user = user;
    next();
  });
};

export const optionalAuth = (req, res, next) => {
  console.log('[API Gateway] Optional auth for route:', req.originalUrl);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, secretKey, (err, user) => {
      if (!err) {
        console.log('[API Gateway] Token verified for user:', user.id);
        req.user = user;
      } else {
        console.log('[API Gateway] Token verification failed, continuing without auth');
      }
    });
  } else {
    console.log('[API Gateway] No token provided, continuing without auth');
  }
  
  next();
};