/**
 * services/productService.js
 * 
 * Service layer containing business logic.
 * This is the ONLY layer that communicates directly with the database layer.
 */

const db = require('../database/db');

class ProductService {
  /**
   * Retrieve list of all products.
   * @returns {Promise<Array>}
   */
  async getAllProducts() {
    return await db.findAll();
  }

  /**
   * Retrieve a single product by ID.
   * @param {string|number} id 
   * @returns {Promise<Object|null>}
   */
  async getProductById(id) {
    if (!id || isNaN(Number(id))) {
      const error = new Error('Invalid product ID');
      error.statusCode = 400;
      throw error;
    }
    return await db.findById(id);
  }

  /**
   * Create a new product.
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async createProduct(data) {
    const { name, price } = data;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      const error = new Error('Product name is required and must be a non-empty string');
      error.statusCode = 400;
      throw error;
    }

    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      const error = new Error('Product price is required and must be a valid non-negative number');
      error.statusCode = 400;
      throw error;
    }

    return await db.create(data);
  }

  /**
   * Full update (PUT) of a product.
   * @param {string|number} id 
   * @param {Object} data 
   * @returns {Promise<Object|null>}
   */
  async updateProduct(id, data) {
    if (!id || isNaN(Number(id))) {
      const error = new Error('Invalid product ID');
      error.statusCode = 400;
      throw error;
    }

    const { name, price } = data;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      const error = new Error('Product name is required for full replace (PUT)');
      error.statusCode = 400;
      throw error;
    }

    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      const error = new Error('Valid non-negative product price is required for full replace (PUT)');
      error.statusCode = 400;
      throw error;
    }

    return await db.update(id, data);
  }

  /**
   * Partial update (PATCH) of a product.
   * @param {string|number} id 
   * @param {Object} data 
   * @returns {Promise<Object|null>}
   */
  async patchProduct(id, data) {
    if (!id || isNaN(Number(id))) {
      const error = new Error('Invalid product ID');
      error.statusCode = 400;
      throw error;
    }

    if (Object.keys(data).length === 0) {
      const error = new Error('At least one field must be provided for partial update (PATCH)');
      error.statusCode = 400;
      throw error;
    }

    if (data.price !== undefined && (isNaN(Number(data.price)) || Number(data.price) < 0)) {
      const error = new Error('Product price must be a valid non-negative number');
      error.statusCode = 400;
      throw error;
    }

    return await db.patch(id, data);
  }

  /**
   * Delete a product by ID.
   * @param {string|number} id 
   * @returns {Promise<boolean>}
   */
  async deleteProduct(id) {
    if (!id || isNaN(Number(id))) {
      const error = new Error('Invalid product ID');
      error.statusCode = 400;
      throw error;
    }

    return await db.delete(id);
  }
}

module.exports = new ProductService();
