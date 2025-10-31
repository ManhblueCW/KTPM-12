import express from 'express';
import { authenticateToken } from '../utils/authMiddleware.js';
import * as playlistService from '../services/playlistService.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const playlists = await playlistService.getPlaylistsByUser(req.user.id);
  res.json(playlists);
});

router.post('/', authenticateToken, async (req, res) => {
  const playlist = await playlistService.createPlaylist({ ...req.body, userId: req.user.id });
  res.status(201).json(playlist);
});

export default router;
