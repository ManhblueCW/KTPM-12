import mongoose from 'mongoose';
import axios from 'axios';
import 'dotenv/config';

// Import models
import User from '../models/User.js';

async function syncUsers() {
  console.log('Connecting to Auth Service database...');
  await mongoose.connect(process.env.MONGO_URI);
  
  console.log('Fetching all users from Auth Service...');
  const users = await User.find().lean();
  
  console.log(`Found ${users.length} users to sync`);
  
  const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';
  
  for (const user of users) {
    try {
      console.log(`Syncing user: ${user.username}`);
      
      await axios.post(`${userServiceUrl}/api/users/internal/sync`, {
        _id: user._id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        favorites: [],
        playlists: [],
        favoritePlaylists: [],
        drive: [],
        following: [],
        followers: [],
        posts: []
      });
      
      console.log(`✓ Synced: ${user.username}`);
    } catch (error) {
      console.error(`✗ Failed to sync ${user.username}:`, error.message);
    }
  }
  
  console.log('Sync completed!');
  process.exit(0);
}

syncUsers().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});