import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secretKey = process.env.JWT_SECRET_KEY;

export const authenticateToken = (req, res, next) => {
  console.log('[Track Service] Authenticating token...');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('[Track Service] No token provided');
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.error('[Track Service] Token verification failed:', err.message);
      return res.sendStatus(401);
    }
    console.log('[Track Service] Token verified for user:', user.id);
    req.user = user;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  console.log('[Track Service] Checking admin role for user:', req.user.id);
  if (req.user.role !== 'admin') {
    console.log('[Track Service] User is not admin');
    return res.status(403).json({ error: 'Unauthorized' });
  }
  console.log('[Track Service] User is admin');
  next();
};