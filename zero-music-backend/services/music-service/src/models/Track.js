import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  duration: { type: Number },
  cover: { type: String },
  track: { type: String },
});

export default mongoose.models.Track || mongoose.model('Track', trackSchema);
