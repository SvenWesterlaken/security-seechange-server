var express = require('express');
var routes = require('./routes/routes');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
const db = require('./db/database');
const config = require('./config/env');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

process.env.NODE_ENV !== 'test' ? db.start() : null;

//setting a global path to index.js (main file) so it can be used to locate certificates
global.appRoot = path.resolve(__dirname);
if (process.env.NODE_ENV === 'test') {
  appRoot += "\\test";
}

// console.log(appRoot);
app.use('/api', routes);

app.listen(config.port, () => {
  console.log(`Running on port: ${config.port}`);
});

module.exports = app;
