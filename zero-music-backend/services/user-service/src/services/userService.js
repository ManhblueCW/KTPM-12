import User from '../models/User.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import 'dotenv/config';
import path from 'path';

/**
 * Cập nhật thông tin người dùng (hỗ trợ cả JSON và multipart/form-data)
 */
export async function updateUser(userId, { username, name, avatarFile, useDefaultAvatar, avatar }) {
  const updateData = {};

  if (username) updateData.username = username;
  if (name) updateData.name = name;

  // ===== 1️⃣ Nếu có upload file avatar mới =====
  if (avatarFile && !useDefaultAvatar) {
    const uploadsDir = path.join(process.cwd(), 'public', 'avatars');
    const ext = path.extname(avatarFile.originalFilename || '');
    const newFilename = `${userId}${ext}`;
    const newPath = path.join(uploadsDir, newFilename);
    const webPath = `/avatars/${newFilename}`;

    // Đảm bảo thư mục tồn tại
    fs.mkdirSync(uploadsDir, { recursive: true });

    // Lưu file
    fs.copyFileSync(avatarFile.filepath, newPath);
    fs.unlinkSync(avatarFile.filepath); // Xóa file tạm

    updateData.avatar = webPath;
    console.log('✅ Avatar file saved:', webPath);
  }

  // ===== 2️⃣ Nếu người dùng truyền avatar URL (không upload file) =====
  else if (avatar && !useDefaultAvatar) {
    updateData.avatar = avatar;
    console.log('✅ Avatar set from URL:', avatar);
  }

  // ===== 3️⃣ Nếu người dùng chọn dùng avatar mặc định =====
  else if (useDefaultAvatar) {
    updateData.avatar = '/assets/default-avatar-s.png';
    console.log('✅ Avatar reset to default');
  }

  // ===== 4️⃣ Cập nhật DB =====
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  console.log('✅ User updated:', user?._id);

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
