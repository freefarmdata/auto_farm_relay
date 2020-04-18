const net = require('net');
const config  = require('config');
const axios = require('axios');
const controller = require('./controller');

axios.defaults.headers.common[ 'Content-Type' ] = 'application/json';
axios.defaults.baseURL = config.get('PANTRY_HOST');

const port = config.get('PORT');
const host = config.get('HOST');

function start(cb) {
  net.createServer(controller.onConnect())
    .listen(port, host, cb);
}

start(() => {
  console.log(`Server started: ${host}:${port}`)
});
