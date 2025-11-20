import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secretKey = process.env.JWT_SECRET_KEY;

export const authenticateToken = (req, res, next) => {
  console.log('[Playlist Service] Authenticating token...');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('[Playlist Service] No token provided');
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.error('[Playlist Service] Token verification failed:', err.message);
      return res.sendStatus(401);
    }
    console.log('[Playlist Service] Token verified for user:', user.id);
    req.user = user;
    next();
  });
};