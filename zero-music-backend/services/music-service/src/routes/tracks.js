import express from 'express';
import * as trackService from '../services/trackService.js';
import { authenticateToken } from '../utils/authMiddleware.js';
import { handleFormidable, storeFile } from '../utils/file.js';

const router = express.Router();

// GET all tracks
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('GET /tracks called');
    const tracks = await trackService.getAllTracks(req.user.id);
    res.json(tracks);
  } catch (err) {
    console.error('GET /tracks error:', err);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// POST /tracks
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    console.log('--- Incoming POST /tracks ---');
    console.log('Headers:', req.headers);

    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      console.log('Detected multipart/form-data → using formidable');
      handleFormidable(req, res, next); // gọi bình thường
      return; // kết thúc middleware hiện tại
    } else {
      console.log('Detected JSON → continue');
      return next();
    }
  } catch (err) {
    console.error('Error in pre-parser:', err);
    return res.status(500).json({ error: 'Failed to parse request', details: err.message });
  }
}, async (req, res) => {
  try {
    console.log('--- Processing track creation ---');

    const trackData = { userId: req.user.id, duration: 0 };

    // 1️⃣ multipart/form-data
    if (req.fields || req.files) {
      const { fields, files } = req;
      console.log('Form-data detected');
      console.log('Fields:', fields);
      console.log('Files:', files);

      trackData.title = fields.title?.[0] || 'Untitled';
      trackData.artist = fields.artist?.[0] || 'Unknown';

      if (files.track) {
        const result = await storeFile(files.track[0], 'tracks', trackData.title);
        trackData.track = result.webPath;
        trackData.duration = 180; // default duration
      }

      if (files.cover) {
        const result = await storeFile(files.cover[0], 'covers', trackData.title);
        trackData.cover = result.webPath;
      }

    } 
    // 2️⃣ JSON body
    else if (req.body && Object.keys(req.body).length > 0) {
      console.log('JSON detected');
      console.log('Body:', req.body);
      Object.assign(trackData, req.body);
    } 
    // 3️⃣ Không có dữ liệu
    else {
      console.warn('No data provided in request');
      return res.status(400).json({ error: 'No data provided' });
    }

    console.log('Final trackData to save:', trackData);

    const track = await trackService.createTrack(trackData, req.user.id);
    console.log('Track created successfully:', track);

    res.status(201).json(track);

  } catch (err) {
    console.error('Error creating track:', err);
    res.status(500).json({ error: 'Failed to create track', details: err.message });
  }
});

export default router;
