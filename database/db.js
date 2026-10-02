/**
 * database/db.js
 * 
 * In-memory database layer for products.
 * Exposes asynchronous operations to read and write product data.
 * The database layer strictly handles data storage and retrieval.
 */

// Initial seed products
let products = [
  { id: 1, name: "Wireless Gaming Mouse", price: 59.99, category: "Electronics" },
  { id: 2, name: "Mechanical Keyboard", price: 129.99, category: "Electronics" },
  { id: 3, name: "Ergonomic Office Chair", price: 249.99, category: "Furniture" }
];

let nextId = 4;

/**
 * Simulate DB latency if needed, or return immediate promises
 */
const db = {
  /**
   * Fetch all products
   * @returns {Promise<Array>}
   */
  async findAll() {
    // Return deep copy to prevent direct external mutation
    return JSON.parse(JSON.stringify(products));
  },

  /**
   * Find product by ID
   * @param {number} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const numericId = Number(id);
    const product = products.find(p => p.id === numericId);
    if (!product) return null;
    return JSON.parse(JSON.stringify(product));
  },

  /**
   * Create a new product
   * @param {Object} productData 
   * @returns {Promise<Object>}
   */
  async create(productData) {
    const newProduct = {
      id: nextId++,
      name: productData.name,
      price: Number(productData.price),
      category: productData.category || "General"
    };
    products.push(newProduct);
    return JSON.parse(JSON.stringify(newProduct));
  },

  /**
   * Full replace (PUT) of an existing product
   * @param {number} id 
   * @param {Object} productData 
   * @returns {Promise<Object|null>}
   */
  async update(id, productData) {
    const numericId = Number(id);
    const index = products.findIndex(p => p.id === numericId);
    if (index === -1) return null;

    const updatedProduct = {
      id: numericId,
      name: productData.name,
      price: Number(productData.price),
      category: productData.category || "General"
    };

    products[index] = updatedProduct;
    return JSON.parse(JSON.stringify(updatedProduct));
  },

  /**
   * Partial update (PATCH) of an existing product
   * @param {number} id 
   * @param {Object} partialData 
   * @returns {Promise<Object|null>}
   */
  async patch(id, partialData) {
    const numericId = Number(id);
    const index = products.findIndex(p => p.id === numericId);
    if (index === -1) return null;

    const existing = products[index];
    const patchedProduct = {
      ...existing,
      ...partialData,
      id: numericId // ensure ID remains unchanged
    };
    if (partialData.price !== undefined) {
      patchedProduct.price = Number(partialData.price);
    }

    products[index] = patchedProduct;
    return JSON.parse(JSON.stringify(patchedProduct));
  },

  /**
   * Delete product by ID
   * @param {number} id 
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const numericId = Number(id);
    const index = products.findIndex(p => p.id === numericId);
    if (index === -1) return false;

    products.splice(index, 1);
    return true;
  }
};

module.exports = db;
