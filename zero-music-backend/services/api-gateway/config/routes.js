export const serviceRoutes = {
  // Auth Service routes
  auth: {
    prefix: '/api',
    routes: [
      { path: '/login', service: 'AUTH_SERVICE_URL', protected: false },
    ]
  },
  
  // User Service routes (handled by both Auth and User services)
  users: {
    prefix: '/api/users',
    routes: [
      { path: '/', method: 'POST', service: 'AUTH_SERVICE_URL', protected: false }, // Register
      { path: '/', method: 'PUT', service: 'AUTH_SERVICE_URL', protected: true }, // Update profile
      { path: '/:userId', method: 'GET', service: 'USER_SERVICE_URL', protected: true }, // Get user info
      { path: '/:userId/playlists', service: 'USER_SERVICE_URL', protected: true },
      { path: '/:userId/favoritePlaylists', service: 'USER_SERVICE_URL', protected: true },
      { path: '/:userId/favorites', service: 'USER_SERVICE_URL', protected: true },
      { path: '/:userId/follow', service: 'USER_SERVICE_URL', protected: true },
      { path: '/:userId/following', service: 'USER_SERVICE_URL', protected: true },
      { path: '/:userId/posts', service: 'USER_SERVICE_URL', protected: true },
    ]
  },
  
  // Track Service routes
  tracks: {
    prefix: '/api/tracks',
    service: 'TRACK_SERVICE_URL',
    protected: false // Some routes need optional auth
  },
  
  // Playlist Service routes
  playlists: {
    prefix: '/api/playlists',
    service: 'PLAYLIST_SERVICE_URL',
    protected: true
  },
  
  // Drive Service routes
  drive: {
    prefix: '/api/drive',
    service: 'DRIVE_SERVICE_URL',
    protected: true
  },
  
  // Favorites Service routes
  favorites: {
    prefix: '/api/favorites',
    service: 'FAVORITES_SERVICE_URL',
    protected: true
  },
  
  // Social Service routes
  posts: {
    prefix: '/api/posts',
    service: 'SOCIAL_SERVICE_URL',
    protected: true
  },
  
  messages: {
    prefix: '/api/messages',
    service: 'SOCIAL_SERVICE_URL',
    protected: true
  },
  
  // Search Service routes
  search: {
    prefix: '/api/search',
    service: 'SEARCH_SERVICE_URL',
    protected: false
  }
};