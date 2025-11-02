import express from 'express';
import { authenticateToken } from '../utils/authMiddleware.js';
import * as userTrackService from '../services/userTrackService.js';
import { storeFile } from '../utils/file.js';
import { parseFile } from 'music-metadata';
import formidable from 'formidable';

const router = express.Router();

// helper async formidable
const handleFormidableAsync = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({ keepExtensions: true, multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

router.get('/', authenticateToken, async (req, res) => {
  const tracks = await userTrackService.getUserDrive(req.user.id);
  res.json(tracks);
});


// POST /drive – cơ chế giống tracks.js
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      handleFormidable(req, res, next);
      return;
    } else {
      // JSON → tiếp tục middleware tiếp theo
      return next();
    }
  } catch (err) {
    console.error('Error in pre-parser:', err);
    return res.status(500).json({ error: 'Failed to parse request', details: err.message });
  }
}, async (req, res) => {
  try {
    const trackData = { userId: req.user.id, duration: 0 };

    // multipart/form-data
    if (req.fields || req.files) {
      const { fields, files } = req;
      trackData.title = fields.title?.[0] || 'Untitled';
      trackData.artist = fields.artist?.[0] || 'Unknown';

      if (files.track) {
        const result = await storeFile(files.track[0], 'driveTracks', trackData.title);
        trackData.track = result.webPath;
        const metadata = await parseFile(result.newPath);
        trackData.duration = Math.round(metadata.format.duration);
      }

      if (files.cover) {
        const result = await storeFile(files.cover[0], 'driveCovers', trackData.title);
        trackData.cover = result.webPath;
      }
    }
    // JSON body
    else if (req.body && Object.keys(req.body).length > 0) {
      Object.assign(trackData, req.body);
      trackData.duration = trackData.duration || 180; // default nếu JSON không có duration
    }
    // Không có dữ liệu
    else {
      return res.status(400).json({ error: 'No files or fields provided' });
    }

    const track = await userTrackService.addUserTrack(req.user.id, trackData);
    res.status(201).json(track);

  } catch (err) {
    console.error('Error uploading user track:', err);
    res.status(500).json({ error: 'Failed to upload track', details: err.message });
  }
});


// DELETE /drive/:trackId
router.delete('/:trackId', authenticateToken, async (req, res) => {
  try {
    await userTrackService.deleteUserTrack(req.user.id, req.params.trackId);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /drive/:trackId error:', err);
    res.status(500).json({ error: 'Failed to delete track', details: err.message });
  }
});

export default router;