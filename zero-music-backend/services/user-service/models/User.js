import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: { type: String, required: false },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
  playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
  favoritePlaylists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
  drive: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserTrack' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  location: { type: String, required: false },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
});

export default mongoose.models.User || mongoose.model('User', userSchema);