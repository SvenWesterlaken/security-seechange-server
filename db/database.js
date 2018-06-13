const mongodb = require('./mongodb');
const config = require('../config/env');

function start() {

  mongodb.connect()
    .once('open', () => console.log(`Connected to Mongo on ${config.mongo.database}`))
    .on('error', err => console.warn('Warning', err.message));

}

module.exports = {
  start
}