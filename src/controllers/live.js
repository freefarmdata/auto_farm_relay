const axios = require('axios');
const retry = require('async-retry');
const config = require('config');
const net = require('net');
const update = require('./update');

const logger = require('../util/logger');

const requestUrl = `${config.get('PANTRY_HOST')}/live`;
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

async function relayData(data) {
  try {
    logger.log('transporting item', data.length);
    await retry(() => axios.post(requestUrl, data), retryOptions);
  } catch (err) {
    logger.log('relay error', err.message);
  }
}

function onData(socket) {
  return async (data) => {
    await Promise.all([updateClient(socket), relayData(data)]);
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