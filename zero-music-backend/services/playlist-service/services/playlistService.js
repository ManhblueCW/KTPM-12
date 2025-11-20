import Playlist from '../models/Playlist.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { addFavoriteStatus } from '../utils/tracks.js';

class PlaylistService {
  async getPlaylistById(playlistId, userId) {
    console.log('[Playlist Service] Getting playlist by ID:', playlistId);
    
    try {
      if (playlistId === 'global') {
        console.log('[Playlist Service] Getting global playlist from Track Service');
        
        // Get global playlist from Track Service
        const response = await axios.get(`${process.env.TRACK_SERVICE_URL}/api/tracks`, {
          headers: {
            'Authorization': `Bearer ${global.currentToken}`
          }
        });
        
        const globalPlaylist = response.data;
        console.log('[Playlist Service] Global playlist has', globalPlaylist.length, 'tracks');
        
        return { success: true, data: globalPlaylist, status: 200 };
      } else {
        const playlist = await Playlist.findById(playlistId)
          .populate('tracks')
          .populate('userId', 'name _id')
          .lean();
        
        if (!playlist) {
          console.log('[Playlist Service] Playlist not found:', playlistId);
          return { success: false, error: 'Playlist not found', status: 404 };
        }

        console.log('[Playlist Service] Playlist found:', playlistId);
        
        if (userId) {
          console.log('[Playlist Service] Adding favorite status for tracks');
          playlist.tracks = await addFavoriteStatus(userId, playlist.tracks);
        }
        
        return { success: true, data: playlist, status: 200 };
      }
    } catch (error) {
      console.error('[Playlist Service] Error getting playlist:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async createPlaylist(userId, title, coverFile) {
    console.log('[Playlist Service] Creating playlist:', title, 'for user:', userId);
    
    try {
      const newFilename = `${title}-${userId}`;
      let coverPath = '';

      if (coverFile) {
        console.log('[Playlist Service] Processing cover file');
        const { storeFile } = await import('../utils/file.js');
        const result = await storeFile(coverFile, 'playlistCovers', newFilename);
        coverPath = result.webPath;
      }

      const updateData = {
        title: title,
        userId: new mongoose.Types.ObjectId(userId),
        cover: coverPath || undefined,
      };

      console.log('[Playlist Service] Saving playlist to database');
      const playlist = new Playlist(updateData);
      await playlist.save();
      
      console.log('[Playlist Service] Playlist created:', playlist._id);
      
      // Update user's playlists in User Service
      try {
        console.log('[Playlist Service] Updating user playlists in User Service');
        await axios.post(`${process.env.USER_SERVICE_URL}/api/users/${userId}/playlists/add`, {
          playlistId: playlist._id.toString()
        }, {
          headers: {
            'Authorization': `Bearer ${global.currentToken}`
          }
        });
        console.log('[Playlist Service] User playlists updated');
      } catch (error) {
        console.error('[Playlist Service] Error updating user playlists:', error.message);
      }
      
      return { success: true, data: playlist, status: 201, message: 'Playlist created' };
    } catch (error) {
      console.error('[Playlist Service] Error creating playlist:', error);
      return { success: false, error: 'Database operation failed', status: 500 };
    }
  }

  async updatePlaylist(playlistId, userId, title, coverFile) {
    console.log('[Playlist Service] Updating playlist:', playlistId);
    
    try {
      // Check ownership
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        console.log('[Playlist Service] Playlist not found:', playlistId);
        return { success: false, error: 'Playlist not found', status: 404 };
      }

      if (playlist.userId.toString() !== userId) {
        console.log('[Playlist Service] User', userId, 'is not owner of playlist', playlistId);
        return { success: false, error: 'Forbidden', status: 403 };
      }

      const newFilename = `${title}-${userId}`;
      let coverPath = '';

      if (coverFile) {
        console.log('[Playlist Service] Processing cover file');
        const { storeFile } = await import('../utils/file.js');
        const result = await storeFile(coverFile, 'playlistCovers', newFilename);
        coverPath = result.webPath;
      }

      const updateData = {
        title: title,
        cover: coverPath || undefined,
      };

      console.log('[Playlist Service] Updating playlist in database');
      const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        updateData,
        { new: true, safe: true, upsert: true }
      );

      console.log('[Playlist Service] Playlist updated successfully:', playlistId);
      return { success: true, data: updatedPlaylist, status: 200, message: 'Playlist updated' };
    } catch (error) {
      console.error('[Playlist Service] Error updating playlist:', error);
      return { success: false, error: 'Database operation failed', status: 500 };
    }
  }

  async deletePlaylist(playlistId, userId) {
    console.log('[Playlist Service] Deleting playlist:', playlistId);
    
    try {
      const playlist = await Playlist.findById(playlistId);
      
      if (!playlist) {
        console.log('[Playlist Service] Playlist not found:', playlistId);
        return { success: false, error: 'Playlist not found', status: 404 };
      }

      // Check ownership
      if (playlist.userId.toString() !== userId) {
        console.log('[Playlist Service] User', userId, 'is not owner of playlist', playlistId);
        return { success: false, error: 'Forbidden', status: 403 };
      }

      // Delete cover image if it exists
      if (playlist.cover) {
        console.log('[Playlist Service] Deleting cover file:', playlist.cover);
        const coverFilePath = path.join(process.cwd(), 'public', playlist.cover);
        if (fs.existsSync(coverFilePath)) {
          fs.unlinkSync(coverFilePath);
        }
      }

      // Delete the playlist
      await Playlist.findByIdAndDelete(playlistId);
      console.log('[Playlist Service] Playlist deleted from database');

      // Remove playlist from user's playlists in User Service
      try {
        console.log('[Playlist Service] Removing playlist from user in User Service');
        await axios.post(`${process.env.USER_SERVICE_URL}/api/users/${userId}/playlists/remove`, {
          playlistId: playlistId
        }, {
          headers: {
            'Authorization': `Bearer ${global.currentToken}`
          }
        });
        console.log('[Playlist Service] Playlist removed from user');
      } catch (error) {
        console.error('[Playlist Service] Error removing playlist from user:', error.message);
      }

      // Remove from all users' favorite playlists
      try {
        console.log('[Playlist Service] Removing playlist from favorite playlists');
        await axios.post(`${process.env.USER_SERVICE_URL}/api/users/playlists/remove-favorite`, {
          playlistId: playlistId
        }, {
          headers: {
            'Authorization': `Bearer ${global.currentToken}`
          }
        });
        console.log('[Playlist Service] Playlist removed from favorites');
      } catch (error) {
        console.error('[Playlist Service] Error removing playlist from favorites:', error.message);
      }

      return { success: true, status: 200, message: 'Playlist deleted' };
    } catch (error) {
      console.error('[Playlist Service] Error deleting playlist:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async favoritePlaylist(userId, playlistId) {
    console.log('[Playlist Service] User', userId, 'favoriting playlist', playlistId);
    
    try {
      // Update in User Service
      await axios.post(`${process.env.USER_SERVICE_URL}/api/users/${userId}/favorite-playlists/add`, {
        playlistId: playlistId
      }, {
        headers: {
          'Authorization': `Bearer ${global.currentToken}`
        }
      });

      console.log('[Playlist Service] Playlist favorited successfully');
      return { success: true, status: 200 };
    } catch (error) {
      console.error('[Playlist Service] Error favoriting playlist:', error);
      return { success: false, error: 'Database operation failed', status: 500 };
    }
  }

  async unfavoritePlaylist(userId, playlistId) {
    console.log('[Playlist Service] User', userId, 'unfavoriting playlist', playlistId);
    
    try {
      // Update in User Service
      await axios.post(`${process.env.USER_SERVICE_URL}/api/users/${userId}/favorite-playlists/remove`, {
        playlistId: playlistId
      }, {
        headers: {
          'Authorization': `Bearer ${global.currentToken}`
        }
      });

      console.log('[Playlist Service] Playlist unfavorited successfully');
      return { success: true, status: 200 };
    } catch (error) {
      console.error('[Playlist Service] Error unfavoriting playlist:', error);
      return { success: false, error: 'Database operation failed', status: 500 };
    }
  }

  async addTrackToPlaylist(playlistId, trackId, userId) {
    console.log('[Playlist Service] Adding track', trackId, 'to playlist', playlistId);
    
    try {
      const playlist = await Playlist.findById(playlistId);
      
      if (!playlist) {
        console.log('[Playlist Service] Playlist not found:', playlistId);
        return { success: false, error: 'Playlist not found', status: 404 };
      }

      // Check ownership
      if (playlist.userId.toString() !== userId) {
        console.log('[Playlist Service] User', userId, 'is not owner of playlist', playlistId);
        return { success: false, error: 'Forbidden', status: 403 };
      }

      await Playlist.findByIdAndUpdate(playlistId, {
        $addToSet: { tracks: new mongoose.Types.ObjectId(trackId) },
      });

      console.log('[Playlist Service] Track added to playlist successfully');
      return { success: true, status: 200 };
    } catch (error) {
      console.error('[Playlist Service] Error adding track to playlist:', error);
      return { success: false, error: 'Database operation failed', status: 500 };
    }
  }

  async removeTrackFromPlaylist(playlistId, trackId, userId) {
    console.log('[Playlist Service] Removing track', trackId, 'from playlist', playlistId);
    
    try {
      const playlist = await Playlist.findById(playlistId);
      
      if (!playlist) {
        console.log('[Playlist Service] Playlist not found:', playlistId);
        return { success: false, error: 'Playlist not found', status: 404 };
      }

      // Check ownership
      if (playlist.userId.toString() !== userId) {
        console.log('[Playlist Service] User', userId, 'is not owner of playlist', playlistId);
        return { success: false, error: 'Forbidden', status: 403 };
      }

      await Playlist.findByIdAndUpdate(playlistId, {
        $pull: { tracks: new mongoose.Types.ObjectId(trackId) },
      });

      console.log('[Playlist Service] Track removed from playlist successfully');
      return { success: true, status: 200 };
    } catch (error) {
      console.error('[Playlist Service] Error removing track from playlist:', error);
      return { success: false, error: 'Database operation failed', status: 500 };
    }
  }
}

export default new PlaylistService();