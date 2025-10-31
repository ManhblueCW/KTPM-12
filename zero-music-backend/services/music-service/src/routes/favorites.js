import express from 'express';
import { authenticateToken } from '../utils/authMiddleware.js';
import * as favoriteService from '../services/favoriteService.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const favorites = await favoriteService.getFavorites(req.user.id);
  res.json(favorites);
});

router.post('/', authenticateToken, async (req, res) => {
  const { trackId } = req.body;
  await favoriteService.addFavorite(req.user.id, trackId);
  res.json({ success: true });
});

router.delete('/:trackId', authenticateToken, async (req, res) => {
  await favoriteService.removeFavorite(req.user.id, req.params.trackId);
  res.json({ success: true });
});

export default router;
