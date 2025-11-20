import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config();
const connection = {};

async function dbConnect() {
  console.log('🔌 [Post Service] Attempting database connection...');
  if (connection.isConnected) {
    console.log('✅ [Post Service] Using existing database connection');
    return;
  }

  const db = await mongoose.connect(process.env.MONGO_URI);
  connection.isConnected = db.connections[0].readyState;
  console.log('✅ [Post Service] Database connected successfully');
}

export default dbConnect;