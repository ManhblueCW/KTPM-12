import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secretKey = process.env.JWT_SECRET_KEY;

export const authenticateToken = (req, res, next) => {
  console.log('[Social Service] Authenticating token...');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('[Social Service] No token provided');
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.error('[Social Service] Token verification failed:', err.message);
      return res.sendStatus(401);
    }
    console.log('[Social Service] Token verified for user:', user.id);
    req.user = user;
    next();
  });
};