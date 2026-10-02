/**
 * cacheStore.js
 * 
 * Custom in-memory Cache Store backed by JavaScript native `Map`.
 * Handles TTL (Time-To-Live) expiration checks upon retrieval.
 */

// Cache TTL constant: 1 minute (60,000 milliseconds)
const DEFAULT_TTL = 60 * 1000;

class CacheStore {
  constructor(defaultTtl = DEFAULT_TTL) {
    this.store = new Map();
    this.ttl = defaultTtl;
  }

  /**
   * Check if entry exists and is not expired.
   * If expired, removes the entry and logs expiration.
   * @param {string} key 
   * @returns {boolean}
   */
  has(key) {
    if (!this.store.has(key)) {
      return false;
    }

    const entry = this.store.get(key);
    const isExpired = Date.now() - entry.createdAt > this.ttl;

    if (isExpired) {
      console.log(`[CACHE] EXPIRED ${key}`);
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cached data for key. Returns null if missing or expired.
   * @param {string} key 
   * @returns {any|null}
   */
  get(key) {
    if (!this.has(key)) {
      return null;
    }

    const entry = this.store.get(key);
    return entry.data;
  }

  /**
   * Set cached data for key with current timestamp.
   * @param {string} key 
   * @param {any} data 
   */
  set(key, data) {
    this.store.set(key, {
      data,
      createdAt: Date.now()
    });
  }

  /**
   * Delete a specific cache key.
   * @param {string} key 
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Clear all entries from the cache store.
   */
  clear() {
    this.store.clear();
  }

  /**
   * Get the current count of cached items.
   * @returns {number}
   */
  size() {
    return this.store.size;
  }
}

// Export a singleton instance of CacheStore
module.exports = new CacheStore();
