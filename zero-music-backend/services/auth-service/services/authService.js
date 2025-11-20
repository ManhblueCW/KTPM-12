import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyPassword } from '../utils/auth.js';
import 'dotenv/config';
import axios from 'axios';

class AuthService {
  async login(username, password) {
    console.log('[Auth Service] Login attempt for username:', username);
    
    try {
      const user = await User.findOne({ username });
      if (!user) {
        console.log('[Auth Service] User not found:', username);
        return { success: false, error: 'No user found', status: 404 };
      }

      console.log('[Auth Service] User found, verifying password...');
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        console.log('[Auth Service] Invalid password for user:', username);
        return { success: false, error: 'Invalid password', status: 401 };
      }

      console.log('[Auth Service] Password valid, generating token...');
      const token = jwt.sign(
        { id: user._id, name: user.name, role: user.role },
        process.env.JWT_SECRET_KEY,
        { algorithm: 'HS256', expiresIn: '1h' }
      );

      console.log('[Auth Service] Login successful for user:', username);
      return {
        success: true,
        data: {
          token,
          userId: user._id.toString(),
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
        status: 200
      };
    } catch (error) {
      console.error('[Auth Service] Login error:', error);
      return { success: false, error: 'An error occurred during login', status: 500 };
    }
  }

  async register(userData, avatarFile) {
    console.log('[Auth Service] Register attempt for username:', userData.username);
    
    try {
      const existingUser = await User.findOne({ username: userData.username });
      if (existingUser) {
        console.log('[Auth Service] Username already exists:', userData.username);
        return { success: false, error: 'Username already exists.', status: 409 };
      }

      console.log('[Auth Service] Hashing password...');
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      let avatarPath = undefined;
      if (avatarFile) {
        console.log('[Auth Service] Processing avatar file...');
        const { storeFile } = await import('../utils/file.js');
        const result = await storeFile(avatarFile, 'avatars', userData.username);
        avatarPath = result.webPath;
      }

      if (userData.useDefaultAvatar) {
        console.log('[Auth Service] Using default avatar');
        avatarPath = '../public/avatars/default-avatar.png';
      }

      console.log('[Auth Service] Creating new user...');
      const user = new User({
        username: userData.username,
        name: userData.name,
        password: hashedPassword,
        avatar: avatarPath,
      });

      await user.save();
      console.log('[Auth Service] User registered successfully:', userData.username);
      try {
        console.log('[Auth Service] Syncing user to User Service...');
        const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';
        
        await axios.post(`${userServiceUrl}/api/users/internal/sync`, {
          _id: user._id,
          username: user.username,
          name: user.name,
          avatar: avatarPath,
          favorites: [],
          playlists: [],
          favoritePlaylists: [],
          drive: [],
          following: [],
          followers: [],
          posts: []
        });
        
        console.log('[Auth Service] User synced to User Service successfully');
      } catch (syncError) {
        console.error('[Auth Service] Failed to sync user to User Service:', syncError.message);
        // Don't fail registration if sync fails - can be retried later
      }
      return { success: true, message: 'User registered successfully!', status: 201 };
    } catch (error) {
      console.error('[Auth Service] Registration error:', error);
      return { success: false, error: 'Registration failed.', status: 500 };
    }
  }

  async updateUser(userId, userData, avatarFile) {
    console.log('[Auth Service] Update user attempt for userId:', userId);
    
    try {
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        console.log('[Auth Service] User not found:', userId);
        return { success: false, error: 'User not found.', status: 404 };
      }

      console.log('[Auth Service] Hashing password...');
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      let avatarPath = existingUser.avatar;
      if (avatarFile) {
        console.log('[Auth Service] Processing avatar file...');
        const { storeFile } = await import('../utils/file.js');
        const result = await storeFile(avatarFile, 'avatars', userData.username);
        avatarPath = result.webPath;
      }

      if (userData.useDefaultAvatar) {
        console.log('[Auth Service] Using default avatar');
        avatarPath = '../public/avatars/default-avatar.png';
      }
      
      console.log('[Auth Service] Updating user...');
      await User.findByIdAndUpdate(userId, {
        username: userData.username,
        name: userData.name,
        password: hashedPassword,
        avatar: avatarPath,
      });

      try {
        console.log('[Auth Service] Syncing user update to User Service...');
        const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';
        
        await axios.put(`${userServiceUrl}/api/users/internal/sync/${userId}`, {
          username: userData.username,
          name: userData.name,
          avatar: avatarPath
        });
        
        console.log('[Auth Service] User update synced successfully');
      } catch (syncError) {
        console.error('[Auth Service] Failed to sync user update:', syncError.message);
      }

      console.log('[Auth Service] User updated successfully:', userId);
      
      return {
        success: true,
        message: 'User updated successfully!',
        data: {
          username: userData.username,
          name: userData.name,
          avatar: avatarPath,
        },
        status: 200
      };
    } catch (error) {
      console.error('[Auth Service] Update user error:', error);
      return { success: false, error: 'Update failed.', status: 500 };
    }
  }

  async getUserById(userId) {
    console.log('[Auth Service] Getting user by ID:', userId);
    
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.log('[Auth Service] User not found:', userId);
        return { success: false, error: 'User not found', status: 404 };
      }

      console.log('[Auth Service] User found:', userId);
      return { success: true, data: user, status: 200 };
    } catch (error) {
      console.error('[Auth Service] Error getting user:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }
}

export default new AuthService();