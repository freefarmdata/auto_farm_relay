function calculateSliceSize(cacheSize, maxCacheSize, sliceSize, maxSliceSize) {
  if (cacheSize > sliceSize) {
    const percentage = cacheSize / maxCacheSize;
    const size = Math.ceil(cacheSize * percentage);
    if (size > sliceSize) {
      return size > maxSliceSize ? maxSliceSize : size;
    }
  }

  return sliceSize;
}

/**
 * Partitions array into chunks of specific size.
 * 
 * Example:
 * 
 *    const arr = [1, 2, 3, 4, 5];
 *    const chunks = arr.reduce(partition(1), []);
 *    // [[1], [2], [3], [4], [5]]
 * 
 * @param {number} count 
 */
function partition(count) {
  let partition = [];
  return (accumulator, currentItem, index, array) => {
    partition.push(currentItem);

    if (partition.length === count || index >= array.length - 1) {
      accumulator.push(partition);
      partition = [];
    }

    return accumulator;
  };
};

module.exports = {
  calculateSliceSize,
  partition
}