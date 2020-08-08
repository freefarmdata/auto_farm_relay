const axios = require('axios');
const retry = require('async-retry');
const config = require('config');
const net = require('net');
const update = require('./update');
const Cache = require('../util/cache');
const slicing = require('../util/slicing');

const logger = require('../util/logger');

const UPDATE_HEADER = 4321;
const DATA_HEADER = 1234;
const maxCacheSize = config.get('MAX_CACHE_SIZE');
const cache = new Cache(maxCacheSize);
const requestUrl = `http://${config.get('PANTRY_HOST')}/live`;
const retryOptions = {
  retries: 3,
  factor: 1.245,
  minTimeout: 500,
  maxTimeout: 3000,
  randomize: 1.245
};

function onConnect() {
  return (socket) => {
    logger.log(`socket connected: ${socket.remoteAddress}:${socket.remotePort}`);
    socket.setTimeout(2000);
    socket.on('data', onData(socket));
    socket.on('error', onError(socket));
    socket.on('timeout', onTimeout(socket));
  }
}

async function updateClient(socket) {
  if (update.cache.modifiers) {
    logger.log('updating client', update.cache.modifiers.length);
    return await new Promise((resolve) => {
      socket.write(update.cache.modifiers, (err) => {
        if (err) {
          logger.log('update error', err);
        }

        update.cache.modifiers = null;
        return resolve();
      });
    });
  }
}

async function relayData() {
  const sliceSize = slicing.calculateSliceSize(cache.size(), maxCacheSize, 50, 500)
  const slice = cache.slice(0, sliceSize);

  logger.log(`transporting ${slice.length} items`, requestUrl);

  const promises = slice
    .reduce(slicing.partition(10), [])
    .map((items) => {
      const { keys, data } = items.reduce((acc, item) => {
        acc.keys.push(item.key);
        acc.data.push(item.data);
        return acc;
      }, { keys: [], data: [] });
      return cache.asyncRemoveIf(keys, async () => {
        await retry(() => axios.post(requestUrl, { data }), retryOptions);
      })
    });

  try {
    await Promise.all(promises);
  } catch (err) {
    logger.log('relay error', err.message);
  }

  logger.log('cache size', cache.size());
}

function onData(socket) {
  return async (data) => {
    const header = Buffer.from(data.slice(0, 4)).readInt32LE();
    if (header === UPDATE_HEADER) {
      await updateClient(socket);
    } else if (header === DATA_HEADER) {
      const state = Buffer.from(data.slice(4, data.length));
      cache.push(state);
      await relayData();
    }
  }
}

function onError(socket) {
  return (error) => {
    logger.log('socket error', error);
    socket.close();
  }
}

function onTimeout(socket) {
  return () => {
    logger.log('socket timeout');
    socket.close();
  }
}

async function initialize() {
  const port = config.get('RELAY_PORT');
  const host = config.get('RELAY_HOST');

  return await new Promise((resolve) => {
    net.createServer(onConnect())
      .listen(port, host, resolve);
  });
}

module.exports = {
  initialize
}