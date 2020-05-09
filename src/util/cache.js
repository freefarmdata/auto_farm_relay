
class Cache {

  constructor(maxSize) {
    this.cache = [];
    this.counter = 0;
    this.count = 0;
    this.maxSize = maxSize;
  }

  /**
   * Removes the key from the cache
   * if the async function does not
   * throw an error
   * @param {number | [number]} key 
   * @param {function} fn 
   */
  async asyncRemoveIf(keys, fn) {
    await fn();
    if (Array.isArray(keys)) {
      keys.forEach(this.remove.bind(this));
    } else {
      this.remove(keys);
    }
  }

  /**
   * Removes the key from the cache
   * if the function does not
   * throw an error
   * @param {number | [number]} key 
   * @param {function} fn 
   */
  syncRemoveIf(keys, fn) {
    fn();
    if (Array.isArray(keys)) {
      keys.forEach(this.remove.bind(this));
    } else {
      this.remove(keys);
    }
  }

  /**
   * Adds the data to the cache if
   * the max size has not been reached
   * @param {any} data 
   */
  push(data) {
    if (this.count < this.maxSize) {
      this.cache[this.counter] = data;
      this.count += 1;
      this.counter += 1;
    }
  }

  /**
   * Removes the key from the cache if
   * it exists
   * @param {number} key 
   */
  remove(key) {
    if (this.cache[key]) {
      delete this.cache[key];
      this.count -= 1;
    }
  }

  /**
   * Returns the size of the cache
   */
  size() {
    return this.count;
  }

  /**
   * Copies the start and end range of 
   * keys from the cache and returns them
   * as an array
   * @param {number} start 
   * @param {number} end 
   * @returns {[{ key: number, data: any }]}
   */
  slice(start, end) {
    const keys = Object.keys(this.cache);
    return keys.slice(start, end).map((key) => ({ key, data: this.cache[key] }));
  }
}

module.exports = Cache;