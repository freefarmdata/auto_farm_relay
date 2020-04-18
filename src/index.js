const net = require('net');
const config  = require('config');
const axios = require('axios');
const live = require('./controllers/live');
const historic = require('./controllers/historic');

axios.defaults.headers.common[ 'Content-Type' ] = 'application/json';

const port = config.get('PORT');
const host = config.get('HOST');

function start(cb) {
  // net.createServer(live.onConnect())
  //   .listen(port, host, cb);

  historic.initialize();
}

start(() => {
  console.log(`Server started: ${host}:${port}`)
});
