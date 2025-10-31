import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { storeFile } from '../utils/file.js';

export async function registerUser({ username, name, password, avatarFile, useDefaultAvatar }) {
  const existingUser = await User.findOne({ username });
  if (existingUser) throw new Error('Username already exists');

  const hashedPassword = await bcrypt.hash(password, 12);

  let avatarPath;
  if (avatarFile) {
    const result = await storeFile(avatarFile, 'avatars', username);
    avatarPath = result.webPath;
  }
  if (useDefaultAvatar) avatarPath = '/assets/default-avatar-s.png';

  const user = new User({ username, name, password: hashedPassword, avatar: avatarPath });
  await user.save();
  return user;
}

export async function updateUser(userId, { username, name, password, avatarFile, useDefaultAvatar }) {
  const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;

  let avatarPath;
  if (avatarFile) {
    const result = await storeFile(avatarFile, 'avatars', username);
    avatarPath = result.webPath;
  }
  if (useDefaultAvatar) avatarPath = '/assets/default-avatar-s.png';

  const updateData = {};
  if (username) updateData.username = username;
  if (name) updateData.name = name;
  if (hashedPassword) updateData.password = hashedPassword;
  if (avatarPath) updateData.avatar = avatarPath;

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  return user;
}

export async function followUser(currentUserId, userIdToFollow) {
  await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: userIdToFollow } });
  await User.findByIdAndUpdate(userIdToFollow, { $addToSet: { followers: currentUserId } });
}

export async function unfollowUser(currentUserId, userIdToUnfollow) {
  await User.findByIdAndUpdate(currentUserId, { $pull: { following: userIdToUnfollow } });
  await User.findByIdAndUpdate(userIdToUnfollow, { $pull: { followers: currentUserId } });
}

export async function getFollowing(userId) {
  const user = await User.findById(userId).populate('following', 'username name avatar').lean();
  return user.following;
}

export async function getFollowers(userId) {
  const user = await User.findById(userId).populate('followers', 'username name avatar').lean();
  return user.followers;
}

export async function getUserById(userId) {
  return await User.findById(userId).select('-password').lean();
}
