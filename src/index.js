global.__basedir = __dirname;

const axios = require('axios');
const proto = require('auto_farm_protos');
const live = require('./controllers/live');
const update = require('./controllers/update');
const historic = require('./controllers/historic');
const logger = require('./util/logger');

axios.defaults.headers.common[ 'Content-Type' ] = 'application/json';

async function start() {
  logger.log('Loading Proto files...');
  proto.initialize();
  logger.log('Starting historic process...');
  historic.initialize();
  logger.log('Starting live process...');
  await live.initialize();
  logger.log('Starting update process...');
  await update.initialize();
  logger.log('Relay Started!');
}

start();
