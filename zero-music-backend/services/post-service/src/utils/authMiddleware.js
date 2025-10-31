import axios from 'axios';

export async function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const resp = await axios.post(`${process.env.AUTH_SERVICE_URL}/verify`, { token });
    req.user = resp.data.user; // Auth service trả về thông tin user
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
