import { getCache, setCache } from "../utils/cache.js";

export function gatewayCache (ttl = 60) {
  return async (req, res, next) => {
    if (req.method !== "GET") return next(); // chỉ cache GET

    const key = `cache:${req.originalUrl}`;

    const cached = await getCache(key);
    if (cached) {
      return res.json(cached);
    }

    // Override res.json để lưu vào cache
    const originalJson = res.json.bind(res);
    res.json = body => {
      setCache(key, body, ttl);
      originalJson(body);
    };

    next();
  };
}
