/**
 * Simple in-memory cache for expensive calculations
 * In production, use Redis or similar
 */
class CacheHelper {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes default TTL
  }

  /**
   * Get cached value
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set cached value
   */
  set(key, value, ttl = this.ttl) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Invalidate cache key
   */
  invalidate(key) {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching pattern
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export default new CacheHelper();
