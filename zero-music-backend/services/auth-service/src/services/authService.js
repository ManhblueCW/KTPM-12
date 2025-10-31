// src/services/authService.js
import User from '../models/User.js';
import { verifyPassword } from '../utils/auth.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export async function login(username, password) {
  if (!username || !password) {
    throw { status: 400, message: 'Username and password are required' };
  }

  const user = await User.findOne({ username });
  if (!user) throw { status: 404, message: 'User not found' };

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) throw { status: 401, message: 'Invalid password' };

  const token = jwt.sign(
    { id: user._id, name: user.name, role: user.role },
    process.env.JWT_SECRET_KEY,
    { algorithm: 'HS256', expiresIn: '2h' }
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    },
  };
}
