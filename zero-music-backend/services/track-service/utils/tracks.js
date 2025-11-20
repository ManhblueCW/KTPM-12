import axios from 'axios';

export async function addFavoriteStatus(userId, tracks) {
  console.log('[Track Service] Adding favorite status for user:', userId);
  console.log('[Track Service] Processing', tracks.length, 'tracks');
  
  try {
    // Call User Service to get user's favorites
    const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${global.currentToken}`
      }
    });
    
    const favorites = response.data.favorites || [];
    console.log('[Track Service] User has', favorites.length, 'favorites');
    
    const tracksWithStatus = tracks.map(track => {
      const isFavorited = favorites.some(favoriteId => favoriteId.toString() === track._id.toString());
      console.log('[Track Service] Track', track._id, 'favorited:', isFavorited);
      return { ...track, isFavorited };
    });

    console.log('[Track Service] Favorite status added successfully');
    return tracksWithStatus;
  } catch (error) {
    console.error('[Track Service] Error adding favorite status:', error.message);
    return tracks;
  }
}