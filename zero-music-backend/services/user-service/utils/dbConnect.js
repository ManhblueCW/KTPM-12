import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();
const connection = {};

async function dbConnect() {
  console.log('[User Service] Attempting to connect to database...');
  
  if (connection.isConnected) {
    console.log('[User Service] Using existing database connection');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    connection.isConnected = db.connections[0].readyState;
    console.log('[User Service] Database connected successfully to:', process.env.MONGO_URI);
  } catch (error) {
    console.error('[User Service] Database connection error:', error);
    throw error;
  }
}

export default dbConnect;