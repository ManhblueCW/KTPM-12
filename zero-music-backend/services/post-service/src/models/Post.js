import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // id từ AuthService
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  trackId: { type: String } // id từ MusicService
});

export default mongoose.models.Post || mongoose.model('Post', postSchema);
