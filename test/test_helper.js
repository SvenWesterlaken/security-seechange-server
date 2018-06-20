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

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
});

// beforeEach((done) => {
//   const users = mongoose.connection.collections;
//   users.drop(() => {
//     done();
//   });
// });