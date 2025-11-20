import axios from 'axios';

export const getUserInfo = async (userId) => {
  console.log(`📡 [Post Service] Fetching user info for ${userId}`);
  try {
    const response = await axios.get(
      `${process.env.USER_SERVICE_URL}/internal/users/${userId}`
    );
    console.log('✅ [Post Service] User info fetched');
    return response.data;
  } catch (error) {
    console.error('❌ [Post Service] Error fetching user info:', error.message);
    return null;
  }
};

export const getTrackInfo = async (trackId) => {
  console.log(`📡 [Post Service] Fetching track info for ${trackId}`);
  try {
    const response = await axios.get(
      `${process.env.TRACK_SERVICE_URL}/api/tracks/${trackId}`
    );
    console.log('✅ [Post Service] Track info fetched');
    return response.data;
  } catch (error) {
    console.error('❌ [Post Service] Error fetching track info:', error.message);
    return null;
  }
};

export const enrichPostsWithDetails = async (posts) => {
  console.log(`🔍 [Post Service] Enriching ${posts.length} posts with user and track details`);
  
  const enrichedPosts = await Promise.all(
    posts.map(async (post) => {
      const enrichedPost = { ...post };
      
      // Get user info
      const userInfo = await getUserInfo(post.userId.toString());
      if (userInfo) {
        enrichedPost.userId = {
          _id: userInfo._id,
          name: userInfo.name,
          avatar: userInfo.avatar
        };
      }
      
      // Get track info if trackId exists
      if (post.trackId) {
        const trackInfo = await getTrackInfo(post.trackId.toString());
        if (trackInfo) {
          enrichedPost.trackId = trackInfo;
        }
      }
      
      return enrichedPost;
    })
  );
  
  console.log('✅ [Post Service] Posts enriched with details');
  return enrichedPosts;
};