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

const link = process.env.NODE_ENV === 'production' ?
    'mongodb://' + env.dbUser + ':' + env.dbPassword + '@' + env.dbHost + ':' + env.dbPort + '/' + env.dbDatabase :
    'mongodb://localhost/' + env.dbDatabase;


env.truYou_api = process.env.TRUYOU_API || 'http://localhost';
env.truYou_api_port = process.env.TRUYOU_API_PORT || 3000;

module.exports = {
    env,
    link
};