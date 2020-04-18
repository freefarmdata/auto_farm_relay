const axios = require('axios');
const retry = require('async-retry');

const retryOptions = {
  retries: 3,
  factor: 1.245,
  minTimeout: 500,
  maxTimeout: 3000,
  randomize: 1.245
};

function onConnect() {
  return (socket) => {
    console.log(`socket connected: ${socket.remoteAddress}:${socket.remotePort}`);
    socket.setTimeout(2000);
    socket.on('data', onData(socket));
    socket.on('close', onClose(socket));
    socket.on('error', onError(socket));
    socket.on('timeout', onTimeout(socket));
  }
}

function onData() {
  return async (data) => {
    try {
      console.log(`transporting item. Length: ${data.length}`);
      await retry(() => axios.post('/ingest', data), retryOptions);
    } catch (err) {
      console.log('relay error', err.message);
    }
  }
}

function onClose(socket) {
  return () => {
    console.log(`socket closed: ${socket.remoteAddress}:${socket.remotePort}`);
  }
}

function onError(socket) {
  return (error) => {
    console.log(error);
    socket.close();
  }
}

function onTimeout(socket) {
  return () => {
    socket.close();
  }
}

module.exports = {
  onConnect
}