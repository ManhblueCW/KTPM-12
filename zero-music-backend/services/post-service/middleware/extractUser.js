export const extractUser = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  
  if (userId) {
    console.log('👤 [Post Service] Extracted user from headers:', userId);
    req.user = { id: userId, role: userRole };
  } else {
    console.log('⚠️  [Post Service] No user found in headers');
  }
  next();
};