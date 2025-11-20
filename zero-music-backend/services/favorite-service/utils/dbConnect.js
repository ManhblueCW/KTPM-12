import mongoose from "mongoose";

const connection = {};

async function dbConnect() {
  console.log('[Favorites Service] Attempting to connect to database...');
  
  if (connection.isConnected) {
    console.log('[Favorites Service] Using existing database connection');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    connection.isConnected = db.connections[0].readyState;
    console.log('[Favorites Service] Database connected successfully to:', process.env.MONGO_URI);
  } catch (error) {
    console.error('[Favorites Service] Database connection error:', error);
    throw error;
  }
}

export default dbConnect;