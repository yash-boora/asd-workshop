/**
 * server.js
 * 
 * Main application bootstrap for Express.js products application.
 * Configures JSON parsing, mounts routes, provides 404 handling and centralized error handling.
 */

const express = require('express');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware for JSON payloads
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// Root endpoint redirect / status
app.get('/', (req, res) => {
  res.json({
    message: 'Products API with Custom TTL Cache Middleware',
    endpoints: '/products'
  });
});

// Mount products router
app.use('/products', productRoutes);

// 404 Handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route Not Found',
    path: req.originalUrl
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Express server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Layered Architecture: Route -> Middleware -> Controller -> Service -> DB`);
    console.log(`Custom TTL Cache: Enabled (60s TTL)`);
    console.log(`==================================================`);
  });
}

module.exports = app;
