import express from 'express';
import favoritesService from '../services/favoritesService.js';
import { authenticateToken } from '../utils/auth.js';

const router = express.Router();

// Add track to favorites
router.post('/', authenticateToken, async (req, res) => {
  console.log('[Favorites Service] POST /api/favorites - Request received');
  
  const userId = req.user.id;
  const { trackId } = req.body;
  
  if (!trackId) {
    console.log('[Favorites Service] Track ID is required');
    return res.status(400).json({ error: 'Track ID is required' });
  }

  global.currentToken = req.headers['authorization']?.split(' ')[1];

  const result = await favoritesService.addFavorite(userId, trackId);
  
  if (result.success) {
    console.log('[Favorites Service] Add favorite successful');
    return res.status(result.status).json({ success: true });
  } else {
    console.log('[Favorites Service] Add favorite failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// Remove track from favorites
router.delete('/:trackId', authenticateToken, async (req, res) => {
  console.log('[Favorites Service] DELETE /api/favorites/:trackId - Request received');
  
  const userId = req.user.id;
  const { trackId } = req.params;
  
  global.currentToken = req.headers['authorization']?.split(' ')[1];

  const result = await favoritesService.removeFavorite(userId, trackId);
  
  if (result.success) {
    console.log('[Favorites Service] Remove favorite successful');
    return res.status(result.status).json({ success: true });
  } else {
    console.log('[Favorites Service] Remove favorite failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// Get user's favorites
router.get('/', authenticateToken, async (req, res) => {
  console.log('[Favorites Service] GET /api/favorites - Request received');
  
  const userId = req.user.id;

  const result = await favoritesService.getUserFavorites(userId);
  
  if (result.success) {
    console.log('[Favorites Service] Get favorites successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[Favorites Service] Get favorites failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// Check if track is favorited
router.get('/check/:trackId', authenticateToken, async (req, res) => {
  console.log('[Favorites Service] GET /api/favorites/check/:trackId - Request received');
  
  const userId = req.user.id;
  const { trackId } = req.params;

  const result = await favoritesService.isFavorited(userId, trackId);
  
  if (result.success) {
    console.log('[Favorites Service] Check favorite successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[Favorites Service] Check favorite failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// Internal route to sync favorites
router.post('/internal/sync', async (req, res) => {
  console.log('[Favorites Service] POST /api/favorites/internal/sync - Request received');
  
  const { userId, trackIds } = req.body;

  if (!userId) {
    console.log('[Favorites Service] User ID is required');
    return res.status(400).json({ error: 'User ID is required' });
  }

  const result = await favoritesService.syncUserFavorites(userId, trackIds);
  
  if (result.success) {
    console.log('[Favorites Service] Sync favorites successful');
    return res.status(result.status).json({ success: true });
  } else {
    console.log('[Favorites Service] Sync favorites failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

export default router;