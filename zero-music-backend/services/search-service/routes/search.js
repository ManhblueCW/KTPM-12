import express from 'express';
import searchService from '../services/searchService.js';

const router = express.Router();

// Search endpoint
router.get('/', async (req, res) => {
  console.log('[Search Service] GET /api/search - Request received');
  
  const { q } = req.query;
  
  if (!q) {
    console.log('[Search Service] Query parameter is required');
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  console.log('[Search Service] Search query:', q);

  const result = await searchService.search(q);
  
  if (result.success) {
    console.log('[Search Service] Search successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[Search Service] Search failed:', result.error);
    return res.status(result.status).json({ message: result.error, error: result.error });
  }
});

// Internal routes for indexing

// Index track
router.post('/internal/index/track', async (req, res) => {
  console.log('[Search Service] POST /api/search/internal/index/track - Request received');
  
  const trackData = req.body;

  if (!trackData.trackId || !trackData.title || !trackData.artist) {
    console.log('[Search Service] Missing required track data');
    return res.status(400).json({ error: 'Missing required track data' });
  }

  const result = await searchService.indexTrack(trackData);
  
  if (result.success) {
    console.log('[Search Service] Track indexing successful');
    return res.status(result.status).json({ success: true });
  } else {
    console.log('[Search Service] Track indexing failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// Remove track index
router.delete('/internal/index/track/:trackId', async (req, res) => {
  console.log('[Search Service] DELETE /api/search/internal/index/track/:trackId - Request received');
  
  const { trackId } = req.params;

  const result = await searchService.removeTrackIndex(trackId);
  
  if (result.success) {
    console.log('[Search Service] Track index removal successful');
    return res.status(result.status).json({ success: true });
  } else {
    console.log('[Search Service] Track index removal failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// Index user
router.post('/internal/index/user', async (req, res) => {
  console.log('[Search Service] POST /api/search/internal/index/user - Request received');
  
  const userData = req.body;

  if (!userData.userId || !userData.name || !userData.username) {
    console.log('[Search Service] Missing required user data');
    return res.status(400).json({ error: 'Missing required user data' });
  }

  const result = await searchService.indexUser(userData);
  
  if (result.success) {
    console.log('[Search Service] User indexing successful');
    return res.status(result.status).json({ success: true });
  } else {
    console.log('[Search Service] User indexing failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// Remove user index
router.delete('/internal/index/user/:userId', async (req, res) => {
  console.log('[Search Service] DELETE /api/search/internal/index/user/:userId - Request received');
  
  const { userId } = req.params;

  const result = await searchService.removeUserIndex(userId);
  
  if (result.success) {
    console.log('[Search Service] User index removal successful');
    return res.status(result.status).json({ success: true });
  } else {
    console.log('[Search Service] User index removal failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// Sync tracks from Track Service
router.post('/internal/sync/tracks', async (req, res) => {
  console.log('[Search Service] POST /api/search/internal/sync/tracks - Request received');

  const result = await searchService.syncTracksFromService();
  
  if (result.success) {
    console.log('[Search Service] Track sync successful');
    return res.status(result.status).json({ success: true, count: result.count });
  } else {
    console.log('[Search Service] Track sync failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// Sync users from User Service
router.post('/internal/sync/users', async (req, res) => {
  console.log('[Search Service] POST /api/search/internal/sync/users - Request received');

  const result = await searchService.syncUsersFromService();
  
  if (result.success) {
    console.log('[Search Service] User sync successful');
    return res.status(result.status).json({ success: true });
  } else {
    console.log('[Search Service] User sync failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

export default router;