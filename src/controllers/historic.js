const sql = require('sqlite3');
const axios = require('axios');
const config = require('config');

const requestUrl = `${config.get('HISTORIC_PANTRY_HOST')}/ingest`;
const FIVE_MINUTES = 5 * 60 * 1000;
const retryOptions = {
  retries: 3,
  factor: 1.245,
  minTimeout: 500,
  maxTimeout: 3000,
  randomize: 1.245
};

let db;

const pipeline = [
  connect(),
  query('temp'),
  relay('temp'),
  drop('temp'),
  query('humid'),
  relay('humid'),
  drop('humid')
]

function connect() {
  return async (request) => {
    return await new Promise((resolve, reject) => {
      db = new sql.Database(config.get('SQL_HOST'), sql.OPEN_READONLY, (err) => {
        if (err) {
          return reject(err);
        }
  
        return resolve(request);
      });
    });
  }
}

async function disconnect() {
  return await new Promise((resolve, reject) => {
    db.close((err) => {
      db = null;

      if (err) {
        console.log(err);
      }

      return resolve(err);
    });
  });
}

function query(key) {
  return async (request) => {

    const statement = `
      SELECT *
      FROM ${key}
      ORDER BY start_time
      LIMIT 10
    `;

    return await new Promise((resolve, reject) => {
      db.all(statement, (err, rows) => {
        if (err) {
          return reject(err);
        }

        request[key] = rows;
  
        return resolve(request);
      });
    });
  };
}

function relay(key) {
  return async (request) => {
    await retry(() => axios.post(requestUrl, { data: request[key] }), retryOptions);
    return request;
  }
}

function drop(key) {
  return async (request) => {
    const data = request[key];
    const ids = data.map((r) => r.id);
    const statement = `DELETE FROM ${key} WHERE id in (${ids})`;

    return await new Promise((resolve, reject) => {
      db.run(statement, (err) => {
        if (err) {
          return reject(err);
        }

        delete request[key];
        return resolve(request);
      });
    });
  }
}

async function process() {
  try {
    await pipeline.reduce(async (p, fn) => await fn(await p), Promise.resolve({}));
  } catch (err) {
    console.log('historic error', err.message);
  } finally {
    await disconnect();
  }
}

function initialize() {
  setInterval(process, FIVE_MINUTES);
}

module.exports = {
  initialize
}