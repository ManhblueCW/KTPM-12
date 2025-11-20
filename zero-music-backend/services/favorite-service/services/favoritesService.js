import Favorite from '../models/Favorite.js';
import axios from 'axios';

class FavoritesService {
  async addFavorite(userId, trackId) {
    console.log('[Favorites Service] Adding favorite - User:', userId, 'Track:', trackId);
    
    try {
      // Check if already favorited
      const existingFavorite = await Favorite.findOne({ userId, trackId });
      if (existingFavorite) {
        console.log('[Favorites Service] Track already favorited');
        return { success: true, status: 200, message: 'Already favorited' };
      }

      // Add to favorites collection
      const favorite = new Favorite({ userId, trackId });
      await favorite.save();
      console.log('[Favorites Service] Favorite added to collection');

      // Update user's favorites in User Service
      try {
        console.log('[Favorites Service] Updating user favorites in User Service');
        await axios.post(`${process.env.USER_SERVICE_URL}/api/users/${userId}/favorites/add`, {
          trackId: trackId
        }, {
          headers: {
            'Authorization': `Bearer ${global.currentToken}`
          }
        });
        console.log('[Favorites Service] User favorites updated');
      } catch (error) {
        console.error('[Favorites Service] Error updating user favorites:', error.message);
        // Rollback favorite if user service update fails
        await Favorite.deleteOne({ userId, trackId });
        return { success: false, error: 'Failed to update user favorites', status: 500 };
      }

      return { success: true, status: 200 };
    } catch (error) {
      console.error('[Favorites Service] Error adding favorite:', error);
      return { success: false, error: 'Database operation failed', status: 500 };
    }
  }

  async removeFavorite(userId, trackId) {
    console.log('[Favorites Service] Removing favorite - User:', userId, 'Track:', trackId);
    
    try {
      // Remove from favorites collection
      const result = await Favorite.deleteOne({ userId, trackId });
      if (result.deletedCount === 0) {
        console.log('[Favorites Service] Favorite not found');
        return { success: true, status: 200, message: 'Favorite not found' };
      }

      console.log('[Favorites Service] Favorite removed from collection');

      // Update user's favorites in User Service
      try {
        console.log('[Favorites Service] Updating user favorites in User Service');
        await axios.post(`${process.env.USER_SERVICE_URL}/api/users/${userId}/favorites/remove`, {
          trackId: trackId
        }, {
          headers: {
            'Authorization': `Bearer ${global.currentToken}`
          }
        });
        console.log('[Favorites Service] User favorites updated');
      } catch (error) {
        console.error('[Favorites Service] Error updating user favorites:', error.message);
      }

      return { success: true, status: 200 };
    } catch (error) {
      console.error('[Favorites Service] Error removing favorite:', error);
      return { success: false, error: 'Database operation failed', status: 500 };
    }
  }

  async getUserFavorites(userId) {
    console.log('[Favorites Service] Getting favorites for user:', userId);
    
    try {
      const favorites = await Favorite.find({ userId }).lean();
      console.log('[Favorites Service] Found', favorites.length, 'favorites');

      const trackIds = favorites.map(fav => fav.trackId);
      
      return { success: true, data: trackIds, status: 200 };
    } catch (error) {
      console.error('[Favorites Service] Error getting favorites:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async isFavorited(userId, trackId) {
    console.log('[Favorites Service] Checking if favorited - User:', userId, 'Track:', trackId);
    
    try {
      const favorite = await Favorite.findOne({ userId, trackId });
      const isFavorited = !!favorite;
      
      console.log('[Favorites Service] Is favorited:', isFavorited);
      return { success: true, data: { isFavorited }, status: 200 };
    } catch (error) {
      console.error('[Favorites Service] Error checking favorite status:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async syncUserFavorites(userId, trackIds) {
    console.log('[Favorites Service] Syncing favorites for user:', userId);
    console.log('[Favorites Service] Track IDs:', trackIds);
    
    try {
      // Remove existing favorites for user
      await Favorite.deleteMany({ userId });
      console.log('[Favorites Service] Existing favorites removed');

      // Add new favorites
      if (trackIds && trackIds.length > 0) {
        const favorites = trackIds.map(trackId => ({
          userId,
          trackId
        }));

        await Favorite.insertMany(favorites);
        console.log('[Favorites Service] New favorites added');
      }

      return { success: true, status: 200 };
    } catch (error) {
      console.error('[Favorites Service] Error syncing favorites:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }
}

export default new FavoritesService();