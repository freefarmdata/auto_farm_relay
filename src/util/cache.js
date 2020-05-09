
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
   * @param {number} key 
   * @param {function} fn 
   */
  async asyncRemoveIf(key, fn) {
    await fn(key);
    this.remove(key);
  }

  /**
   * Removes the key from the cache
   * if the function does not
   * throw an error
   * @param {number} key 
   * @param {function} fn 
   */
  syncRemoveIf(key, fn) {
    fn(key);
    this.remove(key);
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