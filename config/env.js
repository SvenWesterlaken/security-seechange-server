const dotenv = require('dotenv');
const env = {port: process.env.PORT || 8081};

result = dotenv.config();

env.truYou_api = process.env.TRUYOU_API || '';

module.exports = env;
