const express = require('express');
const config = require('config');
const proto = require('../util/proto');

const logger = require('../util/logger');

const cache = {
  modifiers: null
}

function bufferMiddleware(req, res, next) {
  const chunks = [];
  req.on('data', (chunk) => { 
    chunks.push(chunk)
  });
  req.on('end', () => {
      req.body = Buffer.concat(chunks);
      next();
  });
}

function onUpdate(req, res) {
  const data = req.body;

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
  app.post('/update', bufferMiddleware, onUpdate);

  return await new Promise((resolve) => {
    app.listen(port, host, resolve);
  });
}

module.exports = {
  initialize,
  cache
}