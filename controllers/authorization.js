const config = require('../config/env');
const axios = require('axios');
const fs = require('fs');
const https = require('https');

var instance = axios.create({
  url: 'http://httpbin.org/user-agent', //config.truYou_api - will be added when available
  httpsAgent: new https.Agent({ //user agent is used to act on behalf of SeeChange, it gives extra information to the receiver so it can assess the capabilities of the sender
    // ca: fs.readFileSync(`${config.signature}.CA`, "utf8"), //not used, certificate is self-signed
      cert: fs.readFileSync(`C:\\OpenSSL-Win64\\bin\\seechange_server.crt`, "utf8"), //path needs to be changed to `${appRoot}\\seechange_server.crt.txt`
      key: fs.readFileSync(`C:\\OpenSSL-Win64\\bin\\seechange_server.pem`, "utf8"),
    rejectUnauthorized: false
  })
});

module.exports = {
//Checking client authorization token on TruYou server
  authorize(req, res, next) {
    const authorizationToken = req.header('Token') || ''; //token is encrypted, decrypting it is not a task for SeeChange
    const truYouApi = 'http://httpbin.org/user-agent'; //config.truYou_api - will be added when available

    if (authorizationToken != ''){
      const truYou_config = {params: { token: authorizationToken }};
      instance.get(truYouApi, truYou_config).catch(err => next(err)).then(response => {
        res.status(response.status).send(response.data); //TruYou will validate the token, SeeChange only redirects the status and data that is given in the response
      });
    } else {
      res.status(401).json({error: "Invalid token"}); //request is denied when a token is not available
    }
  }
};
