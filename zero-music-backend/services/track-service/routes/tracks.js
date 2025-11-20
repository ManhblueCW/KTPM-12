import express from 'express';
import trackService from '../services/trackService.js';
import { authenticateToken, isAdmin } from '../utils/auth.js';
import { handleFormidable } from '../utils/file.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const router = express.Router();

// GET all tracks
router.get('/', async (req, res) => {
  console.log('[Track Service] GET /api/tracks - Request received');
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let userId = null;
  
  if (token) {
    const secretKey = process.env.JWT_SECRET_KEY;
    jwt.verify(token, secretKey, (err, user) => {
      if (!err) {
        req.user = user;
        userId = user.id;
        global.currentToken = token;
      }
    });
  }

  const result = await trackService.getAllTracks(userId);
  
  if (result.success) {
    console.log('[Track Service] Get all tracks successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[Track Service] Get all tracks failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// GET a track by ID
router.get('/:trackId', async (req, res) => {
  console.log('[Track Service] GET /api/tracks/:trackId - Request received');
  
  const { trackId } = req.params;

  const result = await trackService.getTrackById(trackId);
  
  if (result.success) {
    console.log('[Track Service] Get track successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[Track Service] Get track failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// POST create a new track
router.post('/', authenticateToken, isAdmin, handleFormidable, async (req, res) => {
  console.log('[Track Service] POST /api/tracks - Request received');
  
  const { fields, files } = req;
  const trackData = {
    title: fields.title[0],
    artist: fields.artist[0]
  };

  const result = await trackService.createTrack(trackData, files);
  
  if (result.success) {
    console.log('[Track Service] Create track successful');
    return res.status(result.status).json({ message: result.message, data: result.data });
  } else {
    console.log('[Track Service] Create track failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// PUT update a track
router.put('/:trackId', [authenticateToken, isAdmin, handleFormidable], async (req, res) => {
  console.log('[Track Service] PUT /api/tracks/:trackId - Request received');
  
  const { trackId } = req.params;
  const { fields, files } = req;
  const trackData = {
    title: fields.title[0],
    artist: fields.artist[0]
  };

  const result = await trackService.updateTrack(trackId, trackData, files);
  
  if (result.success) {
    console.log('[Track Service] Update track successful');
    return res.status(result.status).json({ message: result.message, data: result.data });
  } else {
    console.log('[Track Service] Update track failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// DELETE a track
router.delete('/:trackId', [authenticateToken, isAdmin], async (req, res) => {
  console.log('[Track Service] DELETE /api/tracks/:trackId - Request received');
  
  const { trackId } = req.params;

  const result = await trackService.deleteTrack(trackId);
  
  if (result.success) {
    console.log('[Track Service] Delete track successful');
    return res.status(result.status).json({ success: true, message: result.message });
  } else {
    console.log('[Track Service] Delete track failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// GET all comments for a track
router.get('/:trackId/comments', async (req, res) => {
  console.log('[Track Service] GET /api/tracks/:trackId/comments - Request received');
  
  const { trackId } = req.params;

  const result = await trackService.getTrackComments(trackId);
  
  if (result.success) {
    console.log('[Track Service] Get comments successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[Track Service] Get comments failed:', result.error);
    return res.status(result.status).json({ message: result.error });
  }
});

// POST a new comment to a track
router.post('/:trackId/comments', authenticateToken, async (req, res) => {
  console.log('[Track Service] POST /api/tracks/:trackId/comments - Request received');
  
  const { trackId } = req.params;
  const userId = req.user.id;
  const { content, timestamp } = req.body;

  const result = await trackService.addComment(trackId, userId, content, timestamp);
  
  if (result.success) {
    console.log('[Track Service] Add comment successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[Track Service] Add comment failed:', result.error);
    return res.status(result.status).json({ message: result.error });
  }
});

router.post('/batch', async (req, res) => {
  try {
    const tracks = await Track.find({
      _id: { $in: req.body.ids }
    }).lean();

    return res.json({ tracks });
  } catch (err) {
    console.error('[Music Service] Error in batch:', err);
    return res.status(500).json({ error: err.message });
  }
});


export default router;