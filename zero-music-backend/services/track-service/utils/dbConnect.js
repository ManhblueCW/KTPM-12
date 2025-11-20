import mongoose from "mongoose";

const connection = {};

async function dbConnect() {
  console.log('[Track Service] Attempting to connect to database...');
  
  if (connection.isConnected) {
    console.log('[Track Service] Using existing database connection');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    connection.isConnected = db.connections[0].readyState;
    console.log('[Track Service] Database connected successfully to:', process.env.MONGO_URI);
  } catch (error) {
    console.error('[Track Service] Database connection error:', error);
    throw error;
  }
}

export default dbConnect;