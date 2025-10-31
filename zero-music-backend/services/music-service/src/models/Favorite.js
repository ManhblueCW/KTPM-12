import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  trackId: { type: mongoose.Schema.Types.ObjectId, required: true }
});

export default mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);
