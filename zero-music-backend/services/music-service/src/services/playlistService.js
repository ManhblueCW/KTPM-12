import Playlist from '../models/Playlist.js';

export async function getPlaylistsByUser(userId) {
  return await Playlist.find({ userId }).populate('tracks').lean();
}

export async function createPlaylist(data) {
  const playlist = new Playlist(data);
  await playlist.save();
  return playlist;
}

export async function updatePlaylist(playlistId, data) {
  return await Playlist.findByIdAndUpdate(playlistId, data, { new: true });
}

export async function deletePlaylist(playlistId) {
  return await Playlist.findByIdAndDelete(playlistId);
}
