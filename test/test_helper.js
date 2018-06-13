const mongoose = require('mongoose');
const config = require('../config/env');

before((done) => {
  mongoose.Promise = global.Promise;
  mongoose.connect(`${config.mongo.host}/${config.mongo.test}`, config.mongo.options);
  mongoose.connection
    .once('open', () => {
      console.log(`Connected to Mongo on ${config.mongo.test}`);
      done();
    })
    .on("error", (error) => {
      console.warn('Warning', error);
    });
});

beforeEach((done) => {
  const { users } = mongoose.connection.collections;
  users.drop(() => {
    done();
  })
});
