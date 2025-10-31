import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  cover: { type: String },
  tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }]
});

export default mongoose.models.Playlist || mongoose.model('Playlist', playlistSchema);
