const mongoose = require('mongoose');
const config = require('./env/env');

mongoose.connect(config.link);
const connection = mongoose.connection
    .once('open', () => console.log('Connected to ' + config.link))
    .on('error', (err) => console.log(err));

module.exports = connection;