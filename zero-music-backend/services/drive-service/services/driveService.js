import UserTrack from '../models/UserTrack.js';
import { parseFile } from 'music-metadata';
import axios from 'axios';

class DriveService {
  async getDriveTracks(userId) {
    console.log('[Drive Service] Getting drive tracks for user:', userId);
    
    try {
      // Get user's drive track IDs from User Service
      const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${global.currentToken}`
        }
      });
      
      const driveTrackIds = response.data.drive || [];
      console.log('[Drive Service] User has', driveTrackIds.length, 'drive tracks');

      // Get full track details
      const driveTracks = await UserTrack.find({ _id: { $in: driveTrackIds } }).lean();
      console.log('[Drive Service] Retrieved', driveTracks.length, 'drive tracks');
      
      return { success: true, data: driveTracks, status: 200 };
    } catch (error) {
      console.error('[Drive Service] Error getting drive tracks:', error);
      return { success: false, error: 'Failed to retrieve drive tracks', status: 500 };
    }
  }

  async getTrackById(trackId) {
    console.log('[Drive Service] Getting track by ID:', trackId);
    
    try {
      const track = await UserTrack.findById(trackId).lean();
      
      if (!track) {
        console.log('[Drive Service] Track not found:', trackId);
        return { success: false, error: 'Track not found', status: 404 };
      }

      console.log('[Drive Service] Track found:', trackId);
      return { success: true, data: track, status: 200 };
    } catch (error) {
      console.error('[Drive Service] Error getting track:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async getAllTracks() {
    console.log('[Drive Service] Getting all tracks');
    
    try {
      const tracks = await UserTrack.find({}).lean();
      console.log('[Drive Service] Found', tracks.length, 'tracks');
      
      return { success: true, data: tracks, status: 200 };
    } catch (error) {
      console.error('[Drive Service] Error getting all tracks:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async createTrack(userId, trackData, files) {
    console.log('[Drive Service] Creating track for user:', userId);
    
    try {
      const title = trackData.title;
      const artist = trackData.artist;
      const newFilename = `${userId} - ${title} - ${artist}`;

      let trackDuration = 0;
      let trackPath = '';
      let coverPath = '';

      // Process track file
      if (files.track) {
        console.log('[Drive Service] Processing track file');
        const file = Array.isArray(files.track) ? files.track[0] : files.track;
        const { storeFile } = await import('../utils/file.js');
        const result = await storeFile(file, 'driveTracks', newFilename);
        trackPath = result.webPath;

        // Read music metadata
        try {
          console.log('[Drive Service] Reading track metadata');
          const metadata = await parseFile(result.newPath);
          trackDuration = Math.round(metadata.format.duration);
          console.log('[Drive Service] Track duration:', trackDuration, 'seconds');
        } catch (error) {
          console.error('[Drive Service] Error reading metadata:', error);
          return { success: false, error: 'Failed to read file metadata', status: 500 };
        }
      }

      // Process cover file
      if (files.cover) {
        console.log('[Drive Service] Processing cover file');
        const file = Array.isArray(files.cover) ? files.cover[0] : files.cover;
        const { storeFile } = await import('../utils/file.js');
        const result = await storeFile(file, 'driveCovers', newFilename);
        coverPath = result.webPath;
      }

      const updateData = {
        title: title,
        artist: artist,
        duration: trackDuration > 0 ? trackDuration : undefined,
        cover: coverPath || undefined,
        track: trackPath || undefined,
      };

      console.log('[Drive Service] Saving track to database');
      const track = new UserTrack(updateData);
      await track.save();
      
      console.log('[Drive Service] Track created:', track._id);

      // Update user's drive in User Service
      try {
        console.log('[Drive Service] Updating user drive in User Service');
        await axios.post(`${process.env.USER_SERVICE_URL}/api/users/${userId}/drive/add`, {
          trackId: track._id.toString()
        }, {
          headers: {
            'Authorization': `Bearer ${global.currentToken}`
          }
        });
        console.log('[Drive Service] User drive updated');
      } catch (error) {
        console.error('[Drive Service] Error updating user drive:', error.message);
      }
      
      return { success: true, data: track, status: 201, message: 'Track created' };
    } catch (error) {
      console.error('[Drive Service] Error creating track:', error);
      return { success: false, error: 'Database operation failed', status: 500 };
    }
  }

  async updateTrack(trackId, trackData, files) {
    console.log('[Drive Service] Updating track:', trackId);
    
    try {
      const title = trackData.title;
      const artist = trackData.artist;
      const newFilename = `${title} - ${artist}`;

      let trackDuration = 0;
      let trackPath = '';
      let coverPath = '';

      // Process track file
      if (files.track) {
        console.log('[Drive Service] Processing track file');
        const file = Array.isArray(files.track) ? files.track[0] : files.track;
        const { storeFile } = await import('../utils/file.js');
        const result = await storeFile(file, 'driveTracks', newFilename);
        trackPath = result.webPath;

        // Read music metadata
        try {
          console.log('[Drive Service] Reading track metadata');
          const metadata = await parseFile(result.newPath);
          trackDuration = Math.round(metadata.format.duration);
          console.log('[Drive Service] Track duration:', trackDuration, 'seconds');
        } catch (error) {
          console.error('[Drive Service] Error reading metadata:', error);
          return { success: false, error: 'Failed to read file metadata', status: 500 };
        }
      }

      // Process cover file
      if (files.cover) {
        console.log('[Drive Service] Processing cover file');
        const file = Array.isArray(files.cover) ? files.cover[0] : files.cover;
        const { storeFile } = await import('../utils/file.js');
        const result = await storeFile(file, 'driveCovers', newFilename);
        coverPath = result.webPath;
      }

      const updateData = {
        title: title,
        artist: artist,
        duration: trackDuration,
        cover: coverPath || undefined,
        track: trackPath || undefined,
      };

      console.log('[Drive Service] Updating track in database');
      const track = await UserTrack.findByIdAndUpdate(trackId, updateData, { new: true });
      
      if (!track) {
        console.log('[Drive Service] Track not found:', trackId);
        return { success: false, error: 'Track not found', status: 404 };
      }

      console.log('[Drive Service] Track updated successfully:', trackId);
      return { success: true, data: track, status: 200, message: 'Track updated' };
    } catch (error) {
      console.error('[Drive Service] Error updating track:', error);
      return { success: false, error: 'Database operation failed', status: 500 };
    }
  }

  async deleteTrack(trackId, userId) {
    console.log('[Drive Service] Deleting track:', trackId);
    
    try {
      const track = await UserTrack.findByIdAndDelete(trackId);
      
      if (!track) {
        console.log('[Drive Service] Track not found:', trackId);
        return { success: false, error: 'Track not found', status: 404 };
      }

      console.log('[Drive Service] Track deleted from database');

      // Remove track from user's drive in User Service
      try {
        console.log('[Drive Service] Removing track from user drive in User Service');
        await axios.post(`${process.env.USER_SERVICE_URL}/api/users/${userId}/drive/remove`, {
          trackId: trackId
        }, {
          headers: {
            'Authorization': `Bearer ${global.currentToken}`
          }
        });
        console.log('[Drive Service] Track removed from user drive');
      } catch (error) {
        console.error('[Drive Service] Error removing track from user drive:', error.message);
      }

      return { success: true, status: 200, message: 'Track deleted successfully' };
    } catch (error) {
      console.error('[Drive Service] Error deleting track:', error);
      return { success: false, error: 'Failed to delete track', status: 500 };
    }
  }
}

export default new DriveService();