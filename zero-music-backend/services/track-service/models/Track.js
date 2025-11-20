import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  duration: { type: Number, required: true },
  cover: { type: String, required: true },
  track: { type: String, required: true },
  lyrics: [{ type: String }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

export default mongoose.models.Track || mongoose.model('Track', trackSchema);