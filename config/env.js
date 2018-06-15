const dotenv = require('dotenv');
const env = {
  port: process.env.PORT || 8081,
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: process.env.DB_PORT || '',
  dbUser: process.env.DB_USER || '',
  dbPassword: process.env.DB_PASSWORD || '',
  dbDatabase: process.env.DB_DATABASE || 'SeeChange',
};

result = dotenv.config();

if (process.env.NODE_ENV === 'test') {
    result = dotenv.config();

    if (result.error) {
        throw result.error;
    }
}

const link = process.env.NODE_ENV === 'production' ?
  'mongodb://' + env.dbUser + ':' + env.dbPassword + '@' + env.dbHost + ':' + env.dbPort + '/' + env.dbDatabase :
  'mongodb://localhost/' + env.dbDatabase;

env.truYou_api = process.env.TRUYOU_API || 'http://localhost:8080/api';

env.mongo = {
  host: process.env.MONGO_HOST || 'mongodb://127.0.0.1',
  database: process.env.MONGO_DB || 'seechange',
  test: process.env.MONGO_TEST || 'seechange-test',
  options: {
    poolSize: 10,
    user: process.env.MONGO_USER || '',
    pass: process.env.MONGO_PASS || ''
  }
};

module.exports = env, link;
