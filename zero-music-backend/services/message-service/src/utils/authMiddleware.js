import axios from "axios";
import 'dotenv/config';

// Middleware gọi Auth service để verify token
export async function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const resp = await axios.post(`${process.env.AUTH_SERVICE_URL}/verify`, { token });
    req.user = resp.data.user; // Auth service trả về thông tin user
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
