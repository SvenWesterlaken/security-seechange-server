const express = require('express');
const routes = require('./routes/routes');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const db = require('./db/database');
const config = require('./config/env');
const server = require('http').createServer(app);

//setting a global path to index.js (main file) so it can be used to locate certificates
global.appRoot = path.resolve(__dirname);
if (process.env.NODE_ENV === 'test') {
  appRoot += "\\test";
}

// var certificate  = fs.readFileSync(`${appRoot}` + '\\certificates\\certificate.pem', 'utf8'); self-signed certificate not working
// var privateKey = fs.readFileSync(`${appRoot}` + '\\certificates\\key.pem', 'utf8');
// var credentials = {key: privateKey, cert: certificate};
// const server = require('https').createServer(credentials, app);

app.use(bodyParser.json({limit: '50mb'})); //max file size
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
app.use('/api', routes);

server.listen(config.port, () => {
  console.log(`Running on port: ${config.port}`);
});

module.exports = server;