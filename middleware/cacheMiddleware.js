/**
 * middleware/cacheMiddleware.js
 * 
 * Express read-through cache middleware for GET endpoints.
 * Intercepts incoming GET requests, checks `cacheStore`, and either serves 
 * cached data (HIT) or delegates to the controller and caches the 200 OK response (MISS).
 */

const cacheStore = require('../cache/cacheStore');

const cacheMiddleware = (req, res, next) => {
  const cacheKey = req.originalUrl;

  // Check if cache contains a valid, unexpired entry
  if (cacheStore.has(cacheKey)) {
    const cachedData = cacheStore.get(cacheKey);
    if (cachedData !== null) {
      console.log(`[CACHE] HIT ${cacheKey}`);
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cachedData);
    }
  }

  // Cache MISS (entry is missing or was expired)
  console.log(`[CACHE] MISS ${cacheKey}`);
  res.setHeader('X-Cache', 'MISS');

  // Intercept res.json to capture response payload on MISS
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    // Only cache successful 200 OK responses (never 404, 500, etc.)
    if (res.statusCode === 200) {
      cacheStore.set(cacheKey, body);
    }
    return originalJson(body);
  };

  next();
};

module.exports = cacheMiddleware;
