import User from '../models/User.js';

export async function addFavoriteStatus(userId, tracks) {
  console.log('[User Service] Adding favorite status for user:', userId);
  console.log('[User Service] Processing', tracks.length, 'tracks');
  
  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      console.log('[User Service] User not found:', userId);
      return tracks;
    }

    const favorites = user.favorites || [];
    
    const tracksWithStatus = tracks.map(track => {
      const isFavorited = favorites.some(favoriteTrack => favoriteTrack.equals(track._id));
      console.log('[User Service] Track', track._id, 'favorited:', isFavorited);
      return { ...track, isFavorited };
    });

    console.log('[User Service] Favorite status added successfully');
    return tracksWithStatus;
  } catch (error) {
    console.error('[User Service] Error adding favorite status:', error);
    return tracks;
  }
}