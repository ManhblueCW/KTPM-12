import express from 'express';
import userService from '../services/userService.js';
import { authenticateToken } from '../utils/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get user info. populate query can be used to populate fields
router.get('/:userId', authenticateToken, async (req, res) => {
  console.log('[User Service] GET /api/users/:userId - Request received');
  
  let userId = req.params.userId;
  if (userId === 'current') {
    userId = req.user.id;
  }

  const result = await userService.getUserInfo(userId, req.query.populate);
  
  if (result.success) {
    console.log('[User Service] Get user info successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[User Service] Get user info failed:', result.error);
    return res.status(result.status).json({ success: false, message: result.error });
  }
});

// Get user's playlists
router.get('/:userId/playlists', authenticateToken, async (req, res) => {
  console.log('[User Service] GET /api/users/:userId/playlists - Request received');
  
  let userId = req.params.userId;
  if (userId === 'current') {
    userId = req.user.id;
  }

  const currentUserId = req.user.id;
  const result = await userService.getUserPlaylists(userId, currentUserId);
  
  if (result.success) {
    console.log('[User Service] Get playlists successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[User Service] Get playlists failed:', result.error);
    return res.status(result.status).json({ message: 'Server error', error: result.error });
  }
});

// Get user's favorite playlists
router.get('/:userId/favoritePlaylists', authenticateToken, async (req, res) => {
  console.log('[User Service] GET /api/users/:userId/favoritePlaylists - Request received');
  
  let userId = req.params.userId;
  if (userId === 'current') {
    userId = req.user.id;
  }

  const currentUserId = req.user.id;
  const result = await userService.getUserFavoritePlaylists(userId, currentUserId);
  
  if (result.success) {
    console.log('[User Service] Get favorite playlists successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[User Service] Get favorite playlists failed:', result.error);
    return res.status(result.status).json({ message: 'Server error', error: result.error });
  }
});

// Get user's favorite tracks
router.get('/:userId/favorites', authenticateToken, async (req, res) => {
  console.log('[User Service] GET /api/users/:userId/favorites - Request received');
  
  let userId = req.params.userId;
  if (userId === 'current') {
    userId = req.user.id;
  }

  const result = await userService.getUserFavorites(userId);
  
  if (result.success) {
    console.log('[User Service] Get favorites successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[User Service] Get favorites failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// POST to follow a user
router.post('/:userId/follow', authenticateToken, async (req, res) => {
  console.log('[User Service] POST /api/users/:userId/follow - Request received');
  
  const currentUserId = req.user.id;
  const userIdToFollow = req.params.userId;

  const result = await userService.followUser(currentUserId, userIdToFollow);
  
  if (result.success) {
    console.log('[User Service] Follow successful');
    return res.status(result.status).json({ message: result.message, success: true });
  } else {
    console.log('[User Service] Follow failed:', result.error);
    return res.status(result.status).json({ success: false, error: result.error });
  }
});

// DELETE to unfollow a user
router.delete('/:userId/follow', authenticateToken, async (req, res) => {
  console.log('[User Service] DELETE /api/users/:userId/follow - Request received');
  
  const currentUserId = req.user.id;
  const userIdToUnfollow = req.params.userId;

  const result = await userService.unfollowUser(currentUserId, userIdToUnfollow);
  
  if (result.success) {
    console.log('[User Service] Unfollow successful');
    return res.status(result.status).json({ message: result.message, success: true });
  } else {
    console.log('[User Service] Unfollow failed:', result.error);
    return res.status(result.status).json({ success: false, error: result.error });
  }
});

// GET user's following list
router.get('/:userId/following', authenticateToken, async (req, res) => {
  console.log('[User Service] GET /api/users/:userId/following - Request received');
  
  const userId = req.user.id;

  const result = await userService.getFollowing(userId);
  
  if (result.success) {
    console.log('[User Service] Get following successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[User Service] Get following failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// GET user's posts
router.get('/:userId/posts', authenticateToken, async (req, res) => {
  console.log('[User Service] GET /api/users/:userId/posts - Request received');
  
  const { userId } = req.params;

  const result = await userService.getUserPosts(userId);
  
  if (result.success) {
    console.log('[User Service] Get posts successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[User Service] Get posts failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// Internal routes for syncing with auth service
router.post('/internal/sync', async (req, res) => {
  console.log('[User Service] POST /api/users/internal/sync - Request received');
  console.log('[User Service] Sync data:', req.body);
  const userData = req.body;

  const result = await userService.createUser(userData);
  
  if (result.success) {
    console.log('[User Service] User sync successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[User Service] User sync failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

router.put('/internal/sync/:userId', async (req, res) => {
  console.log('[User Service] PUT /api/users/internal/sync/:userId - Request received');
  
  const { userId } = req.params;
  const userData = req.body;

  const result = await userService.updateUser(userId, userData);
  
  if (result.success) {
    console.log('[User Service] User update sync successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[User Service] User update sync failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// routes/users.js trong User Service
router.post('/batch', authenticateToken, async (req, res) => {
  const { ids } = req.body; // array of user IDs

  if (!Array.isArray(ids)) {
    return res.status(400).json({ success: false, message: 'ids must be an array' });
  }

  try {
    const users = await User.find({ _id: { $in: ids } })
      .select('_id username name avatar')
      .lean();

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('[User Service] Error in batch:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});


// POST /api/users/:id/playlists/add
router.post('/:id/playlists/add', async (req, res) => {
  const userId = req.params.id;
  const { playlistId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.playlists.includes(playlistId)) {
      user.playlists.push(playlistId);
      await user.save();
    }

    res.json({ message: 'Playlist added to user', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});




export default router;