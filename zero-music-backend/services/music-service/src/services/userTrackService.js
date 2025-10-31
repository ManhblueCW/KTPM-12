import UserTrack from '../models/UserTrack.js';

export async function getUserDrive(userId) {
  return await UserTrack.find({ userId }).lean();
}

export async function addUserTrack(userId, data) {
  const track = new UserTrack({ ...data, userId });
  await track.save();
  return track;
}

export async function deleteUserTrack(userId, trackId) {
  await UserTrack.deleteOne({ _id: trackId, userId });
}
