import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true },
  addedAt: { type: Date, default: Date.now }
});

// Create compound index to ensure unique user-track combinations
favoriteSchema.index({ userId: 1, trackId: 1 }, { unique: true });

export default mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);