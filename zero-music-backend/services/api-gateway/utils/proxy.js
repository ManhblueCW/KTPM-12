import { createProxyMiddleware } from 'http-proxy-middleware';

export const createServiceProxy = (target, options = {}) => {
  console.log('[API Gateway] Creating proxy for target:', target);
  
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      console.log('[API Gateway] ====== PROXY REQUEST ======');
      console.log('[API Gateway] Target:', target);
      console.log('[API Gateway] Original URL:', req.originalUrl);
      console.log('[API Gateway] Method:', req.method);
      console.log('[API Gateway] Headers:', JSON.stringify(req.headers, null, 2));
      
      // Log body for POST/PUT requests
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        console.log('[API Gateway] Body:', bodyData);
        
        // Re-stream the body for the proxy
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
      
      console.log('[API Gateway] ========================');
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('[API Gateway] ====== PROXY RESPONSE ======');
      console.log('[API Gateway] Status:', proxyRes.statusCode);
      console.log('[API Gateway] Headers:', JSON.stringify(proxyRes.headers, null, 2));
      
      // Log response body
      let body = [];
      proxyRes.on('data', (chunk) => {
        body.push(chunk);
      });
      
      proxyRes.on('end', () => {
        body = Buffer.concat(body).toString();
        console.log('[API Gateway] Response Body:', body);
        console.log('[API Gateway] ==========================');
      });
    },
    onError: (err, req, res) => {
      console.error('[API Gateway] ====== PROXY ERROR ======');
      console.error('[API Gateway] Error:', err.message);
      console.error('[API Gateway] Stack:', err.stack);
      console.error('[API Gateway] Target:', target);
      console.error('[API Gateway] =======================');
      
      res.status(503).json({ 
        error: 'Service Unavailable', 
        message: 'The requested service is currently unavailable',
        service: target,
        details: err.message
      });
    },
    ...options
  });
};