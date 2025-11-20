import Track from '../models/Track.js';
import Comment from '../models/Comment.js';
import { parseFile } from 'music-metadata';
import fs from 'fs';
import path from 'path';
import { addFavoriteStatus } from '../utils/tracks.js';

class TrackService {
  async getAllTracks(userId) {
    console.log('[Track Service] Getting all tracks');
    
    try {
      let tracks = await Track.find().lean();
      console.log('[Track Service] Found', tracks.length, 'tracks');
      
      if (userId) {
        console.log('[Track Service] Adding favorite status for user:', userId);
        tracks = await addFavoriteStatus(userId, tracks);
      }
      
      return { success: true, data: tracks, status: 200 };
    } catch (error) {
      console.error('[Track Service] Error getting all tracks:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async getTrackById(trackId) {
    console.log('[Track Service] Getting track by ID:', trackId);
    
    try {
      const track = await Track.findById(trackId).lean();
      
      if (!track) {
        console.log('[Track Service] Track not found:', trackId);
        return { success: false, error: 'Track not found', status: 404 };
      }

      console.log('[Track Service] Track found:', trackId);
      return { success: true, data: track, status: 200 };
    } catch (error) {
      console.error('[Track Service] Error getting track:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async createTrack(trackData, files) {
    console.log('[Track Service] Creating track:', trackData.title);
    
    try {
      const title = trackData.title;
      const artist = trackData.artist;
      const newFilename = `${title} - ${artist}`;

      let trackDuration = 0;
      let trackPath = '';
      let coverPath = '';

      // Process track file
      if (files.track) {
        console.log('[Track Service] Processing track file');
        const file = Array.isArray(files.track) ? files.track[0] : files.track;
        const { storeFile } = await import('../utils/file.js');
        const result = await storeFile(file, 'tracks', newFilename);
        trackPath = result.webPath;

        // Read music metadata
        try {
          console.log('[Track Service] Reading track metadata');
          const metadata = await parseFile(result.newPath);
          trackDuration = Math.round(metadata.format.duration);
          console.log('[Track Service] Track duration:', trackDuration, 'seconds');
        } catch (error) {
          console.error('[Track Service] Error reading metadata:', error);
          return { success: false, error: 'Failed to read file metadata', status: 500 };
        }
      }

      // Process cover file
      if (files.cover) {
        console.log('[Track Service] Processing cover file');
        const file = Array.isArray(files.cover) ? files.cover[0] : files.cover;
        const { storeFile } = await import('../utils/file.js');
        const result = await storeFile(file, 'covers', newFilename);
        coverPath = result.webPath;
      }

      const updateData = {
        title: title,
        artist: artist,
        duration: trackDuration,
        cover: coverPath || undefined,
        track: trackPath || undefined,
      };

      console.log('[Track Service] Saving track to database');
      const track = new Track(updateData);
      await track.save();
      
      console.log('[Track Service] Track created successfully:', track._id);
      return { success: true, data: track, status: 201, message: 'Track created' };
    } catch (error) {
      console.error('[Track Service] Error creating track:', error);
      return { success: false, error: 'Database operation failed', status: 500 };
    }
  }

  async updateTrack(trackId, trackData, files) {
    console.log('[Track Service] Updating track:', trackId);
    
    try {
      const title = trackData.title;
      const artist = trackData.artist;
      const newFilename = `${title} - ${artist}`;

      let trackDuration = 0;
      let trackPath = '';
      let coverPath = '';

      // Process track file
      if (files.track) {
        console.log('[Track Service] Processing track file');
        const file = Array.isArray(files.track) ? files.track[0] : files.track;
        const { storeFile } = await import('../utils/file.js');
        const result = await storeFile(file, 'tracks', newFilename);
        trackPath = result.webPath;

        // Read music metadata
        try {
          console.log('[Track Service] Reading track metadata');
          const metadata = await parseFile(result.newPath);
          trackDuration = Math.round(metadata.format.duration);
          console.log('[Track Service] Track duration:', trackDuration, 'seconds');
        } catch (error) {
          console.error('[Track Service] Error reading metadata:', error);
          return { success: false, error: 'Failed to read file metadata', status: 500 };
        }
      }

      // Process cover file
      if (files.cover) {
        console.log('[Track Service] Processing cover file');
        const file = Array.isArray(files.cover) ? files.cover[0] : files.cover;
        const { storeFile } = await import('../utils/file.js');
        const result = await storeFile(file, 'covers', newFilename);
        coverPath = result.webPath;
      }

      const updateData = {
        title: title,
        artist: artist,
        duration: trackDuration > 0 ? trackDuration : undefined,
        cover: coverPath || undefined,
        track: trackPath || undefined,
      };

      console.log('[Track Service] Updating track in database');
      const track = await Track.findByIdAndUpdate(trackId, updateData, { new: true });
      
      if (!track) {
        console.log('[Track Service] Track not found:', trackId);
        return { success: false, error: 'Track not found', status: 404 };
      }

      console.log('[Track Service] Track updated successfully:', trackId);
      return { success: true, data: track, status: 200, message: 'Track updated' };
    } catch (error) {
      console.error('[Track Service] Error updating track:', error);
      return { success: false, error: 'Database operation failed', status: 500 };
    }
  }

  async deleteTrack(trackId) {
    console.log('[Track Service] Deleting track:', trackId);
    
    try {
      const track = await Track.findById(trackId);
      
      if (!track) {
        console.log('[Track Service] Track not found:', trackId);
        return { success: false, error: 'Track not found', status: 404 };
      }

      // Delete associated files
      if (track.track) {
        console.log('[Track Service] Deleting track file:', track.track);
        const trackFilePath = path.join(process.cwd(), 'public', track.track);
        if (fs.existsSync(trackFilePath)) {
          fs.unlinkSync(trackFilePath);
        }
      }
      
      if (track.cover) {
        console.log('[Track Service] Deleting cover file:', track.cover);
        const coverFilePath = path.join(process.cwd(), 'public', track.cover);
        if (fs.existsSync(coverFilePath)) {
          fs.unlinkSync(coverFilePath);
        }
      }

      await Track.deleteOne({ _id: trackId });
      console.log('[Track Service] Track deleted successfully:', trackId);
      
      return { success: true, status: 200, message: 'Track deleted' };
    } catch (error) {
      console.error('[Track Service] Error deleting track:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async getTrackComments(trackId) {
    console.log('[Track Service] Getting comments for track:', trackId);
    
    try {
      const track = await Track.findById(trackId)
        .populate({
          path: 'comments',
          populate: {
            path: 'userId',
            select: '_id name avatar'
          }
        })
        .lean();
      
      if (!track) {
        console.log('[Track Service] Track not found:', trackId);
        return { success: false, error: 'Track not found', status: 404 };
      }

      const comments = track.comments || [];
      console.log('[Track Service] Found', comments.length, 'comments for track:', trackId);
      
      return { success: true, data: comments, status: 200 };
    } catch (error) {
      console.error('[Track Service] Error getting comments:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }

  async addComment(trackId, userId, content, timestamp) {
    console.log('[Track Service] Adding comment to track:', trackId, 'by user:', userId);
    
    try {
      const comment = new Comment({
        userId,
        content,
        timestamp,
        trackId
      });

      await comment.save();
      console.log('[Track Service] Comment saved:', comment._id);

      await Track.findByIdAndUpdate(trackId, { $addToSet: { comments: comment._id } });
      console.log('[Track Service] Comment added to track');

      return { success: true, data: comment, status: 201 };
    } catch (error) {
      console.error('[Track Service] Error adding comment:', error);
      return { success: false, error: error.message, status: 500 };
    }
  }
}

export default new TrackService();