/**
 * middleware/invalidateCacheMiddleware.js
 * 
 * Express cache invalidation middleware for write operations (POST, PUT, PATCH, DELETE).
 * Listens to the response completion event ('finish') to verify if the write operation
 * succeeded (status 2xx). Only upon success does it invalidate cached entries.
 */

const cacheStore = require('../cache/cacheStore');

const invalidateCacheMiddleware = (req, res, next) => {
  // Listen for response completion
  res.on('finish', () => {
    // Only invalidate cache if the write request returned a 2xx success status code
    // Do NOT invalidate on validation errors (400), non-existent resources (404), or server errors (500)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      /**
       * CACHE INVALIDATION STRATEGY:
       * 
       * Why clear all product-related entries?
       * 1. POST creates a new product, which changes the total list returned by GET /products.
       * 2. PUT / PATCH updates a product, altering both GET /products list and GET /products/:id.
       * 3. DELETE removes a product, altering both GET /products list and GET /products/:id.
       * 
       * Clearing the full product cache store (`cacheStore.clear()`) is the simplest and safest
       * strategy to guarantee absolute data consistency across all list and detail routes without
       * leaving dangling or stale references.
       */
      cacheStore.clear();
      console.log(`[CACHE] INVALIDATED due to successful ${req.method} ${req.originalUrl}`);
    }
  });

  next();
};

module.exports = invalidateCacheMiddleware;
