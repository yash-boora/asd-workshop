/**
 * routes/productRoutes.js
 * 
 * Express routes definition for Product resources.
 * Follows strict Request Flow: Route -> Middleware -> Controller -> Service -> Database.
 */

const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const cacheMiddleware = require('../middleware/cacheMiddleware');
const invalidateCacheMiddleware = require('../middleware/invalidateCacheMiddleware');

// GET /products - List all products (cached)
router.get('/', cacheMiddleware, (req, res, next) => productController.getAll(req, res, next));

// GET /products/:id - Get one product (cached)
router.get('/:id', cacheMiddleware, (req, res, next) => productController.getById(req, res, next));

// POST /products - Create product (invalidates cache on 2xx)
router.post('/', invalidateCacheMiddleware, (req, res, next) => productController.create(req, res, next));

// PUT /products/:id - Full replace product (invalidates cache on 2xx)
router.put('/:id', invalidateCacheMiddleware, (req, res, next) => productController.update(req, res, next));

// PATCH /products/:id - Partial update product (invalidates cache on 2xx)
router.patch('/:id', invalidateCacheMiddleware, (req, res, next) => productController.patch(req, res, next));

// DELETE /products/:id - Delete product (invalidates cache on 2xx)
router.delete('/:id', invalidateCacheMiddleware, (req, res, next) => productController.delete(req, res, next));

module.exports = router;
