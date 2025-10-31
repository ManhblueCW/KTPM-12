import Favorite from '../models/Favorite.js';

export async function getFavorites(userId) {
  return await Favorite.find({ userId }).populate('trackId').lean();
}

export async function addFavorite(userId, trackId) {
  const exists = await Favorite.findOne({ userId, trackId });
  if (!exists) {
    const fav = new Favorite({ userId, trackId });
    await fav.save();
  }
}

export async function removeFavorite(userId, trackId) {
  await Favorite.deleteOne({ userId, trackId });
}
