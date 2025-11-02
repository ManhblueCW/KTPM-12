import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String }, // không required nữa
  avatar: { type: String, default: '/assets/default-avatar-s.png' },
  role: { type: String, default: 'user' },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

export default mongoose.models.User || mongoose.model('User', userSchema);
