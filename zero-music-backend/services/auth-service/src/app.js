// src/app.js
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Auth DB connected"))
  .catch(err => console.error("DB connection error:", err));

export default app;
