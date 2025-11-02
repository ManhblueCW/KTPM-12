import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken, verifyPassword } from "../utils/auth.js";
import axios from "axios";

const router = express.Router();

// Đăng ký
router.post("/register", async (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password || !name)
    return res.status(400).json({ error: "Missing fields" });

  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, name });
  await user.save();

  // ✅ Gọi sang user-service để đồng bộ
  try {
    console.log(process.env.USER_SERVICE_URL);
    await axios.post(`${process.env.USER_SERVICE_URL}/create`, {
      userId: user._id,
      username: user.username,
      name: user.name,
      avatar: "/assets/default-avatar-s.png",
    });
  } catch (err) {
    console.error("User-service sync failed:", err.message);
  }

  res.status(201).json({ message: "User created" });
});

// Đăng nhập
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const valid = await verifyPassword(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = generateToken({ id: user._id, username: user.username, role: user.role });

  res.json({
    token,
    user: { id: user._id, username: user.username, role: user.role },
  });
});

// Verify token
router.post("/verify", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Missing token" });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});
export default router;
