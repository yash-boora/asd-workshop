/**
 * controllers/productController.js
 * 
 * Controller layer for handling HTTP requests and responses.
 * Delegates all business logic and database access to productService.
 */

const productService = require('../services/productService');

class ProductController {
  /**
   * GET /products
   * Fetch all products
   */
  async getAll(req, res, next) {
    try {
      const products = await productService.getAllProducts();
      return res.status(200).json(products);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /products/:id
   * Fetch single product by ID
   */
  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${req.params.id} not found` });
      }
      return res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /products
   * Create a new product
   */
  async create(req, res, next) {
    try {
      const newProduct = await productService.createProduct(req.body);
      return res.status(201).json(newProduct);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /products/:id
   * Full replace of product
   */
  async update(req, res, next) {
    try {
      const updatedProduct = await productService.updateProduct(req.params.id, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ error: `Product with ID ${req.params.id} not found` });
      }
      return res.status(200).json(updatedProduct);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /products/:id
   * Partial update of product
   */
  async patch(req, res, next) {
    try {
      const patchedProduct = await productService.patchProduct(req.params.id, req.body);
      if (!patchedProduct) {
        return res.status(404).json({ error: `Product with ID ${req.params.id} not found` });
      }
      return res.status(200).json(patchedProduct);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /products/:id
   * Delete product by ID
   */
  async delete(req, res, next) {
    try {
      const deleted = await productService.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: `Product with ID ${req.params.id} not found` });
      }
      return res.status(200).json({ message: `Product with ID ${req.params.id} successfully deleted` });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductController();
