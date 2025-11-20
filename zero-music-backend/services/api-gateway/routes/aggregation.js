import express from 'express';
import axios from 'axios';

const router = express.Router();

// Service URLs from environment
const services = {
  user: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  track: process.env.TRACK_SERVICE_URL || 'http://localhost:3003',
  playlist: process.env.PLAYLIST_SERVICE_URL || 'http://localhost:3004',
};

// Helper: Get authorization header
const getAuthHeader = (req) => {
  return { Authorization: req.headers.authorization };
};

// =============================================
// GET USER FAVORITES WITH FULL TRACK DATA
// =============================================
router.get('/users/:userId/favorites', async (req, res) => {
  console.log('[API Gateway Aggregation] GET /users/:userId/favorites');
  
  try {
    let userId = req.params.userId;
    if (userId === 'current') {
      userId = req.user.id;
    }

    console.log('[API Gateway Aggregation] Fetching favorite IDs from User Service...');
    
    // Step 1: Get favorite track IDs from User Service
    const favoritesRes = await axios.get(
      `${services.user}/api/users/${userId}/favorites`,
      { headers: getAuthHeader(req) }
    );

    const favoriteIds = favoritesRes.data;
    console.log('[API Gateway Aggregation] Got', favoriteIds.length, 'favorite IDs');

    if (!favoriteIds || favoriteIds.length === 0) {
      console.log('[API Gateway Aggregation] No favorites found');
      return res.json([]);
    }

    // Step 2: Get full track details from Track Service
    console.log('[API Gateway Aggregation] Fetching track details from Track Service...');
    const trackPromises = favoriteIds.map(trackId =>
      axios.get(`${services.track}/api/tracks/${trackId}`)
        .catch(err => {
          console.error(`[API Gateway Aggregation] Error fetching track ${trackId}:`, err.message);
          return null;
        })
    );

    const trackResponses = await Promise.all(trackPromises);
    const tracks = trackResponses
      .filter(r => r !== null)
      .map(r => r.data);

    // Step 3: Add isFavorited flag (always true for favorites page)
    const tracksWithFavorite = tracks.map(track => ({
      ...track,
      isFavorited: true
    }));

    console.log('[API Gateway Aggregation] Returning', tracksWithFavorite.length, 'tracks');
    res.json(tracksWithFavorite);
    
  } catch (error) {
    console.error('[API Gateway Aggregation] Error getting favorites:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || 'Failed to get favorites' 
    });
  }
});

// =============================================
// GET USER PLAYLISTS WITH FULL DATA
// =============================================
router.get('/users/:userId/playlists', async (req, res) => {
  console.log('[API Gateway Aggregation] GET /users/:userId/playlists');
  
  try {
    let userId = req.params.userId;
    if (userId === 'current') {
      userId = req.user.id;
    }

    console.log('[API Gateway Aggregation] Fetching playlist IDs from User Service...');
    
    // Step 1: Get playlist IDs from User Service
    const playlistsRes = await axios.get(
      `${services.user}/api/users/${userId}/playlists`,
      { headers: getAuthHeader(req) }
    );

    const playlistIds = playlistsRes.data;
    console.log('[API Gateway Aggregation] Got', playlistIds.length, 'playlist IDs');

    if (!playlistIds || playlistIds.length === 0) {
      console.log('[API Gateway Aggregation] No playlists found');
      return res.json([]);
    }

    // Step 2: Get full playlist details from Playlist Service
    console.log('[API Gateway Aggregation] Fetching playlist details from Playlist Service...');
    const playlistPromises = playlistIds.map(playlistId =>
      axios.get(`${services.playlist}/api/playlists/${playlistId}`, {
        headers: getAuthHeader(req)
      })
        .catch(err => {
          console.error(`[API Gateway Aggregation] Error fetching playlist ${playlistId}:`, err.message);
          return null;
        })
    );

    const playlistResponses = await Promise.all(playlistPromises);
    const playlists = playlistResponses
      .filter(r => r !== null)
      .map(r => r.data);

    console.log('[API Gateway Aggregation] Returning', playlists.length, 'playlists');
    res.json(playlists);
    
  } catch (error) {
    console.error('[API Gateway Aggregation] Error getting playlists:', error.message);
    res.status(error.response?.status || 500).json({ 
      message: 'Server error',
      error: error.response?.data?.error || 'Failed to get playlists' 
    });
  }
});

// =============================================
// GET USER FAVORITE PLAYLISTS WITH FULL DATA
// =============================================
router.get('/users/:userId/favoritePlaylists', async (req, res) => {
  console.log('[API Gateway Aggregation] GET /users/:userId/favoritePlaylists');
  
  try {
    let userId = req.params.userId;
    if (userId === 'current') {
      userId = req.user.id;
    }

    console.log('[API Gateway Aggregation] Fetching favorite playlist IDs from User Service...');
    
    // Step 1: Get favorite playlist IDs from User Service
    const playlistsRes = await axios.get(
      `${services.user}/api/users/${userId}/favoritePlaylists`,
      { headers: getAuthHeader(req) }
    );

    const playlistIds = playlistsRes.data;
    console.log('[API Gateway Aggregation] Got', playlistIds.length, 'favorite playlist IDs');

    if (!playlistIds || playlistIds.length === 0) {
      console.log('[API Gateway Aggregation] No favorite playlists found');
      return res.json([]);
    }

    // Step 2: Get full playlist details from Playlist Service
    console.log('[API Gateway Aggregation] Fetching playlist details from Playlist Service...');
    const playlistPromises = playlistIds.map(playlistId =>
      axios.get(`${services.playlist}/api/playlists/${playlistId}`, {
        headers: getAuthHeader(req)
      })
        .catch(err => {
          console.error(`[API Gateway Aggregation] Error fetching playlist ${playlistId}:`, err.message);
          return null;
        })
    );

    const playlistResponses = await Promise.all(playlistPromises);
    const playlists = playlistResponses
      .filter(r => r !== null)
      .map(r => r.data);

    console.log('[API Gateway Aggregation] Returning', playlists.length, 'favorite playlists');
    res.json(playlists);
    
  } catch (error) {
    console.error('[API Gateway Aggregation] Error getting favorite playlists:', error.message);
    res.status(error.response?.status || 500).json({ 
      message: 'Server error',
      error: error.response?.data?.error || 'Failed to get favorite playlists' 
    });
  }
});

export default router;