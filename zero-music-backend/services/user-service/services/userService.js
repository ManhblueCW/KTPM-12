import User from '../models/User.js';
import Post from '../models/Post.js';
import axios from 'axios';
import { addFavoriteStatus } from '../utils/tracks.js';

class UserService {
  async getUserInfo(userId, populate) {
    console.log('[User Service] Getting user info for userId:', userId);
    
    try {
      let query = User.findById(userId);
      
      if (populate) {
        console.log('[User Service] Populating:', populate);
        query = query.populate(populate);
      }
      
      const user = await query;
      
      if (!user) {
        console.log('[User Service] User not found:', userId);
        return { success: false, error: 'User not found', status: 404 };
      }

      console.log('[User Service] User found:', userId);
      return { success: true, data: user, status: 200 };
    } catch (error) {
      console.error('[User Service] Error getting user info:', error);
      return { success: false, error: error.message, status: 400 };
    }
  }

  async getUserPlaylists(userId, currentUserId) {
    console.log('[User Service] Getting playlists for userId:', userId);
    
    try {
      const user = await User.findById(userId).lean();
      
      if (!user) {
        console.log('[User Service] User not found:', userId);
        return { success: false, error: 'User not found', status: 404 };
      }

      const playlistIds = user.playlists || [];
    console.log('[User Service] Found playlist IDs:', playlistIds);

    if (playlistIds.length === 0) {
      return { success: true, data: [], status: 200 };
    }

    // ❗ Gọi Playlist Service để lấy Playlist detail
    const response = await axios.post(
      "http://localhost:3004/api/playlists/batch",
      { ids: playlistIds }
    );

    let playlists = response.data.playlists;

    // Check favorite status
    if (userId !== currentUserId) {
      const currentUser = await User.findById(currentUserId).lean();
      const favIds = currentUser.favoritePlaylists || [];

      playlists = playlists.map(p => ({
        ...p,
        isFavorited: favIds.some(id => id === p._id)
      }));
    }
      
      return { success: true, data: playlists, status: 200 };
    } catch (error) {
      console.error('[User Service] Error getting playlists:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async getUserFavoritePlaylists(userId, currentUserId) {
    console.log('[User Service] Getting favorite playlists for userId:', userId);
    
    try {
      const user = await User.findById(userId).lean();
      
      if (!user) {
        console.log('[User Service] User not found:', userId);
        return { success: false, error: 'User not found', status: 404 };
      }

       const favoriteIds = user.favoritePlaylists || [];
    console.log('[User Service] Favorite playlist IDs:', favoriteIds);

    if (favoriteIds.length === 0) {
      return { success: true, data: [], status: 200 };
    }

    // ❗ Call Playlist Service
    const resp = await axios.post(
      "http://localhost:3004/api/playlists/batch",
      { ids: favoriteIds }
    );

    let playlists = resp.data.playlists;

      
      return { success: true, data: playlists, status: 200 };
    } catch (error) {
      console.error('[User Service] Error getting favorite playlists:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async getUserFavorites(userId) {
    console.log('[User Service] Getting favorites for userId:', userId);
    
    try {
      const user = await User.findById(userId).lean();
      
      if (!user) {
        console.log('[User Service] User not found:', userId);
        return { success: false, error: 'User not found', status: 404 };
      }
      
      const favoriteIds = user.favorites || [];
    console.log(`[User Service] Found ${favoriteIds.length} favorite track IDs`);

    if (favoriteIds.length === 0) {
      return { success: true, data: [], status: 200 };
    }

    // ⬇ CALL MUSIC SERVICE để lấy thông tin Track
    const response = await axios.post(
      "http://localhost:3003/api/tracks/batch",
      { ids: favoriteIds }
    );

    const tracks = response.data.tracks;

    return { success: true, data: tracks, status: 200 };
    } catch (error) {
      console.error('[User Service] Error getting favorites:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async followUser(currentUserId, userIdToFollow) {
    console.log('[User Service] User', currentUserId, 'following user', userIdToFollow);
    
    try {
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: userIdToFollow } });
      await User.findByIdAndUpdate(userIdToFollow, { $addToSet: { followers: currentUserId } });

      console.log('[User Service] Follow successful');
      return { success: true, message: 'Followed successfully', status: 200 };
    } catch (error) {
      console.error('[User Service] Error following user:', error);
      return { success: false, error: 'Failed to update follow status', status: 500 };
    }
  }

  async unfollowUser(currentUserId, userIdToUnfollow) {
    console.log('[User Service] User', currentUserId, 'unfollowing user', userIdToUnfollow);
    
    try {
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: userIdToUnfollow } });
      await User.findByIdAndUpdate(userIdToUnfollow, { $pull: { followers: currentUserId } });

      console.log('[User Service] Unfollow successful');
      return { success: true, message: 'Unfollowed successfully', status: 200 };
    } catch (error) {
      console.error('[User Service] Error unfollowing user:', error);
      return { success: false, error: 'Failed to update follow status', status: 500 };
    }
  }

  async getFollowing(userId) {
    console.log('[User Service] Getting following list for userId:', userId);
    
    try {
      const user = await User.findById(userId).populate('following').lean();
      
      if (!user) {
        console.log('[User Service] User not found:', userId);
        return { success: false, error: 'User not found', status: 404 };
      }

      console.log('[User Service] Found', user.following.length, 'following for user:', userId);
      return { success: true, data: user.following, status: 200 };
    } catch (error) {
      console.error('[User Service] Error getting following:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async getUserPosts(userId) {
    console.log('[User Service] Getting posts for userId:', userId);
    
    try {
      const posts = await Post.find({ userId: userId })
        .sort({ timestamp: -1 })
        .populate('userId', 'name avatar')
        .populate('trackId')
        .lean();

      console.log('[User Service] Found', posts.length, 'posts for user:', userId);
      return { success: true, data: posts, status: 200 };
    } catch (error) {
      console.error('[User Service] Error getting posts:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async createUser(userData) {
  console.log('[User Service] Creating user:', userData._id);
  
  try {
    // Check if user already exists
    const existingUser = await User.findById(userData._id);
    if (existingUser) {
      console.log('[User Service] User already exists, updating instead:', userData._id);
      // Update instead of error
      return await this.updateUser(userData._id, userData);
    }

    const user = new User({
      _id: userData._id, // Use the same _id from Auth Service
      username: userData.username,
      name: userData.name,
      avatar: userData.avatar,
      favorites: userData.favorites || [],
      playlists: userData.playlists || [],
      favoritePlaylists: userData.favoritePlaylists || [],
      drive: userData.drive || [],
      following: userData.following || [],
      followers: userData.followers || [],
      posts: userData.posts || [],
      location: userData.location || ''
    });
    
    await user.save();
    
    console.log('[User Service] User created successfully:', userData._id);
    return { success: true, data: user, status: 201 };
  } catch (error) {
    console.error('[User Service] Error creating user:', error);
    return { success: false, error: error.message, status: 500 };
  }
}

  async updateUser(userId, userData) {
    console.log('[User Service] Updating user:', userId);
    
    try {
      const user = await User.findByIdAndUpdate(userId, userData, { new: true });
      
      if (!user) {
        console.log('[User Service] User not found:', userId);
        return { success: false, error: 'User not found', status: 404 };
      }

      console.log('[User Service] User updated successfully:', userId);
      return { success: true, data: user, status: 200 };
    } catch (error) {
      console.error('[User Service] Error updating user:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }
}


export default new UserService();