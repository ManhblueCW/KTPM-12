export const extractUser = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  
  if (userId) {
    console.log('👤 [Message Service] Extracted user from headers:', userId);
    req.user = { id: userId, role: userRole };
  } else {
    console.log('⚠️  [Message Service] No user found in headers');
  }
  next();
};