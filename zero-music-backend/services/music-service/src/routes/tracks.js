import express from 'express';
import * as trackService from '../services/trackService.js';
import { authenticateToken } from '../utils/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const tracks = await trackService.getAllTracks(req.user.id);
  res.json(tracks);
});

router.post('/', authenticateToken, async (req, res) => {
  const track = await trackService.createTrack(req.body);
  res.status(201).json(track);
});

export default router;
