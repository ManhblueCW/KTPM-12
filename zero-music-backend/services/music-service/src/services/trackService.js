import Track from '../models/Track.js';
import Favorite from '../models/Favorite.js';

export async function getAllTracks(userId) {
  const tracks = await Track.find().lean();
  if (userId) {
    const favs = await Favorite.find({ userId }).lean();
    const favTrackIds = favs.map(f => f.trackId.toString());
    return tracks.map(track => ({
      ...track,
      isFavorited: favTrackIds.includes(track._id.toString())
    }));
  }
  return tracks;
}

export async function createTrack(data) {
  const track = new Track(data);
  await track.save();
  return track;
}

export async function getTrackById(trackId) {
  return await Track.findById(trackId).lean();
}

export async function updateTrack(trackId, data) {
  return await Track.findByIdAndUpdate(trackId, data, { new: true });
}

export async function deleteTrack(trackId) {
  return await Track.findByIdAndDelete(trackId);
}
