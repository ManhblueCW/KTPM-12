import express from 'express';
import { authenticateToken } from '../utils/authMiddleware.js';
import * as userTrackService from '../services/userTrackService.js';
import { handleFormidable, storeFile } from '../utils/file.js';
import { parseFile } from 'music-metadata';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const tracks = await userTrackService.getUserDrive(req.user.id);
  res.json(tracks);
});

router.post('/', [authenticateToken, handleFormidable], async (req, res) => {
  const { fields, files } = req;
  let trackPath, coverPath, duration = 0;

  if (files.track) {
    const result = await storeFile(files.track[0], 'driveTracks', fields.title[0]);
    trackPath = result.webPath;
    const metadata = await parseFile(result.newPath);
    duration = Math.round(metadata.format.duration);
  }

  if (files.cover) {
    coverPath = (await storeFile(files.cover[0], 'driveCovers', fields.title[0])).webPath;
  }

  const track = await userTrackService.addUserTrack(req.user.id, {
    title: fields.title[0],
    artist: fields.artist[0],
    track: trackPath,
    cover: coverPath,
    duration
  });

  res.status(201).json(track);
});

router.delete('/:trackId', authenticateToken, async (req, res) => {
  await userTrackService.deleteUserTrack(req.user.id, req.params.trackId);
  res.json({ success: true });
});

export default router;
