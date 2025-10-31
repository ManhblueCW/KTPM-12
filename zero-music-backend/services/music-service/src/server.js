import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';

import tracksRouter from './routes/tracks.js';
import favoritesRouter from './routes/favorites.js';
import userDriveRouter from './routes/userDrive.js';
import playlistsRouter from './routes/playlists.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/tracks', tracksRouter);
app.use('/favorites', favoritesRouter);
app.use('/drive', userDriveRouter);
app.use('/playlists', playlistsRouter);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Music DB connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Music service running on port ${PORT}`));
