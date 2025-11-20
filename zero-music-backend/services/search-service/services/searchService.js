import { TrackIndex, UserIndex } from '../models/SearchIndex.js';
import axios from 'axios';

class SearchService {
  async search(query) {
    console.log('[Search Service] Searching for:', query);
    
    try {
      // Search in tracks
      console.log('[Search Service] Searching tracks...');
      const trackResults = await TrackIndex.find({
        title: { $regex: query, $options: 'i' }
      }).select('trackId title cover artist duration').lean();

      console.log('[Search Service] Found', trackResults.length, 'tracks');

      // Format track results
      const tracks = trackResults.map(track => ({
        _id: track.trackId,
        title: track.title,
        cover: track.cover,
        artist: track.artist,
        duration: track.duration
      }));

      // Search in users
      console.log('[Search Service] Searching users...');
      const userResults = await UserIndex.find({
        name: { $regex: query, $options: 'i' }
      }).select('userId name avatar').lean();

      console.log('[Search Service] Found', userResults.length, 'users');

      // Format user results
      const users = userResults.map(user => ({
        _id: user.userId,
        name: user.name,
        avatar: user.avatar
      }));

      const results = {
        tracks: tracks,
        users: users
      };

      console.log('[Search Service] Search completed. Total results:', tracks.length + users.length);
      return { success: true, data: results, status: 200 };
    } catch (error) {
      console.error('[Search Service] Search error:', error);
      return { success: false, error: 'Error accessing the database', status: 500 };
    }
  }

  async indexTrack(trackData) {
    console.log('[Search Service] Indexing track:', trackData.trackId);
    
    try {
      await TrackIndex.findOneAndUpdate(
        { trackId: trackData.trackId },
        {
          trackId: trackData.trackId,
          title: trackData.title,
          artist: trackData.artist,
          cover: trackData.cover,
          duration: trackData.duration,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      console.log('[Search Service] Track indexed successfully');
      return { success: true, status: 200 };
    } catch (error) {
      console.error('[Search Service] Error indexing track:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async removeTrackIndex(trackId) {
    console.log('[Search Service] Removing track index:', trackId);
    
    try {
      await TrackIndex.deleteOne({ trackId: trackId });
      console.log('[Search Service] Track index removed');
      return { success: true, status: 200 };
    } catch (error) {
      console.error('[Search Service] Error removing track index:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async indexUser(userData) {
    console.log('[Search Service] Indexing user:', userData.userId);
    
    try {
      await UserIndex.findOneAndUpdate(
        { userId: userData.userId },
        {
          userId: userData.userId,
          name: userData.name,
          username: userData.username,
          avatar: userData.avatar,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      console.log('[Search Service] User indexed successfully');
      return { success: true, status: 200 };
    } catch (error) {
      console.error('[Search Service] Error indexing user:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async removeUserIndex(userId) {
    console.log('[Search Service] Removing user index:', userId);
    
    try {
      await UserIndex.deleteOne({ userId: userId });
      console.log('[Search Service] User index removed');
      return { success: true, status: 200 };
    } catch (error) {
      console.error('[Search Service] Error removing user index:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async syncTracksFromService() {
    console.log('[Search Service] Syncing tracks from Track Service...');
    
    try {
      const response = await axios.get(`${process.env.TRACK_SERVICE_URL}/api/tracks`);
      const tracks = response.data;
      
      console.log('[Search Service] Fetched', tracks.length, 'tracks from Track Service');

      for (const track of tracks) {
        await this.indexTrack({
          trackId: track._id,
          title: track.title,
          artist: track.artist,
          cover: track.cover,
          duration: track.duration
        });
      }

      console.log('[Search Service] Track sync completed');
      return { success: true, count: tracks.length, status: 200 };
    } catch (error) {
      console.error('[Search Service] Error syncing tracks:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async syncUsersFromService() {
    console.log('[Search Service] Syncing users from User Service...');
    
    try {
      // This would require a special endpoint in User Service to get all users
      // For now, we'll just log that this feature needs to be implemented
      console.log('[Search Service] User sync feature needs User Service endpoint');
      
      return { success: true, status: 200 };
    } catch (error) {
      console.error('[Search Service] Error syncing users:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }
}

export default new SearchService();