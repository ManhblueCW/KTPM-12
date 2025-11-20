import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export async function verifyPassword(password, hashedPassword) {
  console.log('[Auth Service] Verifying password...');
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log('[Auth Service] Password verification result:', isValid);
  return isValid;
}

const secretKey = process.env.JWT_SECRET_KEY;

export const authenticateToken = (req, res, next) => {
  console.log('[Auth Service] Authenticating token...');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('[Auth Service] No token provided');
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.error('[Auth Service] Token verification failed:', err.message);
      return res.sendStatus(401);
    }
    console.log('[Auth Service] Token verified for user:', user.id);
    req.user = user;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  console.log('[Auth Service] Checking admin role for user:', req.user.id);
  if (req.user.role !== 'admin') {
    console.log('[Auth Service] User is not admin');
    return res.status(403).json({ error: 'Unauthorized' });
  }
  console.log('[Auth Service] User is admin');
  next();
};

export const generateToken = (payload) => {
  console.log('[Auth Service] Generating token for user:', payload.id);
  return jwt.sign(payload, secretKey, { expiresIn: '2h' });
};

export const verifyToken = (token) => {
  console.log('[Auth Service] Verifying token...');
  try {
    const decoded = jwt.verify(token, secretKey);
    console.log('[Auth Service] Token verified successfully');
    return decoded;
  } catch (e) {
    console.error('[Auth Service] Token verification error:', e.message);
    return null;
  }
};