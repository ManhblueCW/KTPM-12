import mongoose from 'mongoose';

const userTrackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  duration: { type: Number, required: true },
  cover: { type: String, required: true },
  track: { type: String, required: true }
});

export default mongoose.models.UserTrack || mongoose.model('UserTrack', userTrackSchema);