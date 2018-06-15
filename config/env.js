const dotenv = require('dotenv');
const env = {port: process.env.PORT || 8081};

result = dotenv.config();

if (result.error) {
  throw result.error;
}

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

module.exports = env;
