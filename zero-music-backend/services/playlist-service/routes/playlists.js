import express from 'express';
import playlistService from '../services/playlistService.js';
import { authenticateToken } from '../utils/auth.js';
import { handleFormidable } from '../utils/file.js';
import Playlist from '../models/Playlist.js';

const router = express.Router();

// GET playlist by ID or global playlist
router.get('/:playlistId', authenticateToken, async (req, res) => {
  console.log('[Playlist Service] GET /api/playlists/:playlistId - Request received');
  
  const userId = req.user.id;
  const { playlistId } = req.params;
  
  global.currentToken = req.headers['authorization']?.split(' ')[1];

  const result = await playlistService.getPlaylistById(playlistId, userId);
  
  if (result.success) {
    console.log('[Playlist Service] Get playlist successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[Playlist Service] Get playlist failed:', result.error);
    return res.status(result.status).json({ message: 'Server error', error: result.error });
  }
});

// POST new playlist
router.post('', authenticateToken, handleFormidable, async (req, res) => {
  console.log('[Playlist Service] POST /api/playlists - Request received');
  
  const userId = req.user.id;
  const title = req.fields.title[0];
  
  global.currentToken = req.headers['authorization']?.split(' ')[1];

  const coverFile = req.files.cover 
    ? (Array.isArray(req.files.cover) ? req.files.cover[0] : req.files.cover) 
    : null;

  const result = await playlistService.createPlaylist(userId, title, coverFile);
  
  if (result.success) {
    console.log('[Playlist Service] Create playlist successful');
    return res.status(result.status).json({ message: result.message, data: result.data });
  } else {
    console.log('[Playlist Service] Create playlist failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// PUT update existing playlist
router.put('/:playlistId', authenticateToken, handleFormidable, async (req, res) => {
  console.log('[Playlist Service] PUT /api/playlists/:playlistId - Request received');
  
  const { playlistId } = req.params;
  const userId = req.user.id;
  const title = req.fields.title[0];

  const coverFile = req.files.cover 
    ? (Array.isArray(req.files.cover) ? req.files.cover[0] : req.files.cover) 
    : null;

  const result = await playlistService.updatePlaylist(playlistId, userId, title, coverFile);
  
  if (result.success) {
    console.log('[Playlist Service] Update playlist successful');
    return res.status(result.status).json({ message: result.message, data: result.data });
  } else {
    console.log('[Playlist Service] Update playlist failed:', result.error);
    return res.status(result.status).json({ error: result.error, message: result.error });
  }
});

// DELETE a playlist
router.delete('/:playlistId', authenticateToken, async (req, res) => {
  console.log('[Playlist Service] DELETE /api/playlists/:playlistId - Request received');
  
  const userId = req.user.id;
  const { playlistId } = req.params;
  
  global.currentToken = req.headers['authorization']?.split(' ')[1];

  const result = await playlistService.deletePlaylist(playlistId, userId);
  
  if (result.success) {
    console.log('[Playlist Service] Delete playlist successful');
    return res.status(result.status).json({ message: result.message });
  } else {
    console.log('[Playlist Service] Delete playlist failed:', result.error);
    return res.status(result.status).json({ message: result.error, error: result.error });
  }
});

// Favorite playlist operations
router.post('/:playlistId/favorite', authenticateToken, async (req, res) => {
  console.log('[Playlist Service] POST /api/playlists/:playlistId/favorite - Request received');
  
  const userId = req.user.id;
  const { playlistId } = req.body;
  
  global.currentToken = req.headers['authorization']?.split(' ')[1];

  const result = await playlistService.favoritePlaylist(userId, playlistId);
  
  if (result.success) {
    console.log('[Playlist Service] Favorite playlist successful');
    return res.status(result.status).json({ success: true });
  } else {
    console.log('[Playlist Service] Favorite playlist failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

router.delete('/:playlistId/favorite', authenticateToken, async (req, res) => {
  console.log('[Playlist Service] DELETE /api/playlists/:playlistId/favorite - Request received');
  
  const userId = req.user.id;
  const { playlistId } = req.body;
  
  global.currentToken = req.headers['authorization']?.split(' ')[1];

  const result = await playlistService.unfavoritePlaylist(userId, playlistId);
  
  if (result.success) {
    console.log('[Playlist Service] Unfavorite playlist successful');
    return res.status(result.status).json({ success: true });
  } else {
    console.log('[Playlist Service] Unfavorite playlist failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// Add a track to a playlist
router.post('/:playlistId/tracks', authenticateToken, async (req, res) => {
  console.log('[Playlist Service] POST /api/playlists/:playlistId/tracks - Request received');
  
  const { playlistId } = req.params;
  const { trackId } = req.body;
  const userId = req.user.id;

  const result = await playlistService.addTrackToPlaylist(playlistId, trackId, userId);
  
  if (result.success) {
    console.log('[Playlist Service] Add track to playlist successful');
    return res.status(result.status).json({ success: true });
  } else {
    console.log('[Playlist Service] Add track to playlist failed:', result.error);
    return res.status(result.status).json({ error: result.error, message: result.error });
  }
});

// Remove a track from a playlist
router.delete('/:playlistId/tracks/:trackId', authenticateToken, async (req, res) => {
  console.log('[Playlist Service] DELETE /api/playlists/:playlistId/tracks/:trackId - Request received');
  
  const { playlistId, trackId } = req.params;
  const userId = req.user.id;

  const result = await playlistService.removeTrackFromPlaylist(playlistId, trackId, userId);
  
  if (result.success) {
    console.log('[Playlist Service] Remove track from playlist successful');
    return res.status(result.status).json({ success: true });
  } else {
    console.log('[Playlist Service] Remove track from playlist failed:', result.error);
    return res.status(result.status).json({ error: result.error, message: result.error });
  }
});

router.post('/batch', async (req, res) => {
  try {
    const { ids } = req.body;

    const playlists = await Playlist.find({ _id: { $in: ids } })
      .lean();

    res.json(playlists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;