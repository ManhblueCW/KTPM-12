import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import "dotenv/config";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error("JWT_SECRET must be defined in .env");

// Hash và verify password
export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Tạo JWT
export function generateToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: "2h" });
}

// Verify JWT (nếu muốn Auth service tự verify)
export function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey);
  } catch {
    return null;
  }
}
