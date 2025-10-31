import mongoose from 'mongoose';

const userTrackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  duration: { type: Number },
  cover: { type: String },
  track: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true }
});

export default mongoose.models.UserTrack || mongoose.model('UserTrack', userTrackSchema);
