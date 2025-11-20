import mongoose from "mongoose";

const connection = {};

async function dbConnect() {
  if (connection.isConnected) {
    console.log('✓ Using existing database connection');
    return;
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log(`📌 MONGO_URI: ${process.env.MONGO_URI}`);
    
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    connection.isConnected = db.connections[0].readyState;
    console.log('✓ MongoDB connected successfully');
    console.log(`✓ Database: ${db.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('📌 Make sure MongoDB is running on localhost:27017');
    console.error('📌 Or update MONGO_URI in your .env file');
    process.exit(1);
  }
}

export default dbConnect;