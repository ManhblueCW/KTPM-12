import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import "dotenv/config";

const secretKey = process.env.JWT_SECRET_KEY;

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: "2h" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey);
  } catch (e) {
    return null;
  }
}
