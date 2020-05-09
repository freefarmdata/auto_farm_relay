const axios = require('axios');
const retry = require('async-retry');
const config = require('config');
const net = require('net');
const update = require('./update');
const Cache = require('../util/cache');

const logger = require('../util/logger');

const cache = new Cache(config.get('MAX_CACHE_SIZE'));

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
  const promises = [];
  for (const item of cache.slice(0, 10)) {
    promises.push(cache.asyncRemoveIf(item.key, async () => {
      const data = item.data;
      logger.log('transporting item', data.length, requestUrl);
      await retry(() => axios.post(requestUrl, { data }), retryOptions);
    }));
  }

  try {
    await Promise.all(promises);
  } catch (err) {
    logger.log('relay error', err.message);
  }

  logger.log('cache size', cache.size());
}

function onData(socket) {
  return async (data) => {
    cache.push(data);
    await Promise.all([updateClient(socket), relayData()]);
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