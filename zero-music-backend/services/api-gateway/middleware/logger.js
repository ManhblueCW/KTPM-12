export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  console.log('[API Gateway] ====================================');
  console.log('[API Gateway] Incoming Request');
  console.log('[API Gateway] Method:', req.method);
  console.log('[API Gateway] URL:', req.originalUrl);
  console.log('[API Gateway] Headers:', JSON.stringify(req.headers, null, 2));
  console.log('[API Gateway] Body:', JSON.stringify(req.body, null, 2));
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log('[API Gateway] Response Status:', res.statusCode);
    console.log('[API Gateway] Duration:', duration, 'ms');
    console.log('[API Gateway] ====================================');
  });
  
  next();
};