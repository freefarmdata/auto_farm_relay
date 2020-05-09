const express = require('express');
const config = require('config');
const proto = require('auto_farm_protos');

const logger = require('../util/logger');

const cache = {
  modifiers: null
}

function onUpdate(req, res) {
  const { data } = req.body;

  const schema = proto.Schemas.V1.Modifiers;
  const error = schema.verify(data);
  if (error) {
    return res.status(400).send('Invalid Modifiers Schema');
  }

  cache.modifiers = data;
  return res.status(200);
}

async function initialize() {
  const port = config.get('UPDATE_PORT');
  const host = config.get('UPDATE_HOST');
  const app = express();
  app.post('/update', onUpdate);

  return await new Promise((resolve) => {
    app.listen(port, host, resolve);
  });
}

module.exports = {
  initialize,
  cache
}