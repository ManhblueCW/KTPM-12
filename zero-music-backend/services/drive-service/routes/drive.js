import express from 'express';
import driveService from '../services/driveService.js';
import { authenticateToken } from '../utils/auth.js';
import { handleFormidable } from '../utils/file.js';

const router = express.Router();

// GET all drive tracks for user
router.get('/', authenticateToken, async (req, res) => {
  console.log('[Drive Service] GET /api/drive - Request received');
  
  const userId = req.user.id;
  global.currentToken = req.headers['authorization']?.split(' ')[1];

  const result = await driveService.getDriveTracks(userId);
  
  if (result.success) {
    console.log('[Drive Service] Get drive tracks successful');
    return res.status(result.status).json(result.data);
  } else {
    console.log('[Drive Service] Get drive tracks failed:', result.error);
    return res.status(result.status).json({ success: false, error: result.error });
  }
});

// GET a track by ID or all tracks
router.get('/:trackId?', authenticateToken, async (req, res) => {
  console.log('[Drive Service] GET /api/drive/:trackId - Request received');
  
  const { trackId } = req.params;

  if (trackId) {
    const result = await driveService.getTrackById(trackId);
    
    if (result.success) {
      console.log('[Drive Service] Get track successful');
      return res.status(result.status).json(result.data);
    } else {
      console.log('[Drive Service] Get track failed:', result.error);
      return res.status(result.status).json({ error: result.error });
    }
  } else {
    const result = await driveService.getAllTracks();
    
    if (result.success) {
      console.log('[Drive Service] Get all tracks successful');
      return res.status(result.status).json(result.data);
    } else {
      console.log('[Drive Service] Get all tracks failed:', result.error);
      return res.status(result.status).json({ error: result.error });
    }
  }
});

// POST create a new track
router.post('/', authenticateToken, handleFormidable, async (req, res) => {
  console.log('[Drive Service] POST /api/drive - Request received');
  
  const userId = req.user.id;
  const { fields, files } = req;
  const trackData = {
    title: fields.title[0],
    artist: fields.artist[0]
  };
  
  global.currentToken = req.headers['authorization']?.split(' ')[1];

  const result = await driveService.createTrack(userId, trackData, files);
  
  if (result.success) {
    console.log('[Drive Service] Create track successful');
    return res.status(result.status).json({ message: result.message, data: result.data });
  } else {
    console.log('[Drive Service] Create track failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// PUT update a track
router.put('/:trackId', authenticateToken, handleFormidable, async (req, res) => {
  console.log('[Drive Service] PUT /api/drive/:trackId - Request received');
  
  const { trackId } = req.params;
  const { fields, files } = req;
  const trackData = {
    title: fields.title[0],
    artist: fields.artist[0]
  };

  const result = await driveService.updateTrack(trackId, trackData, files);
  
  if (result.success) {
    console.log('[Drive Service] Update track successful');
    return res.status(result.status).json({ message: result.message, data: result.data });
  } else {
    console.log('[Drive Service] Update track failed:', result.error);
    return res.status(result.status).json({ error: result.error });
  }
});

// DELETE a track
router.delete('/:trackId', authenticateToken, async (req, res) => {
  console.log('[Drive Service] DELETE /api/drive/:trackId - Request received');
  
  const { trackId } = req.params;
  const userId = req.user.id;
  
  global.currentToken = req.headers['authorization']?.split(' ')[1];

  const result = await driveService.deleteTrack(trackId, userId);
  
  if (result.success) {
    console.log('[Drive Service] Delete track successful');
    return res.status(result.status).json({ success: true, message: result.message });
  } else {
    console.log('[Drive Service] Delete track failed:', result.error);
    return res.status(result.status).json({ success: false, error: result.error });
  }
});

export default router;