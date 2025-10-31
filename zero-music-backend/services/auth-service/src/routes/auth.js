import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken, verifyPassword } from "../utils/auth.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password || !name) return res.status(400).json({ error: "Missing fields" });

  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, name });
  await user.save();

  res.status(201).json({ message: "User created" });
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const valid = await verifyPassword(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = generateToken({ id: user._id, username: user.username, role: user.role });
  res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
});

// Verify token
router.post("/verify", (req, res) => {
  const { token } = req.body;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid token" });
  res.json({ user });
});

export default router;
