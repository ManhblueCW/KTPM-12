import mongoose from 'mongoose';

// Track index for search
const trackIndexSchema = new mongoose.Schema({
  trackId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  title: { type: String, required: true },
  artist: { type: String, required: true },
  cover: { type: String, required: true },
  duration: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now }
});

// Create text index for searching
trackIndexSchema.index({ title: 'text', artist: 'text' });

export const TrackIndex = mongoose.models.TrackIndex || mongoose.model('TrackIndex', trackIndexSchema);

// User index for search
const userIndexSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String },
  lastUpdated: { type: Date, default: Date.now }
});

// Create text index for searching
userIndexSchema.index({ name: 'text', username: 'text' });

export const UserIndex = mongoose.models.UserIndex || mongoose.model('UserIndex', userIndexSchema);