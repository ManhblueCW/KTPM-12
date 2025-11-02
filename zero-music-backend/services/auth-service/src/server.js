import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import "dotenv/config";

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Auth DB connected"))
  .catch(err => console.error("Mongo connection error:", err));

app.use("/", authRoutes);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
