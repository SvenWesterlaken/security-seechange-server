const config = require('../config/env');
const axios = require('axios');
const fs = require('fs');
const https = require('https');
const User = require('../models/user');

module.exports = {
//Checking client authorization token on TruYou server
  authorize(req, res, next) {
    var instance = axios.create({ //self-signed certificate probably does not work - api for testing not available yet
      url: config.truYou_api, //working link to check agent = 'http://httpbin.org/user-agent'
      httpsAgent: new https.Agent({ //user agent is used to act on behalf of SeeChange, it gives extra information to the receiver so it can assess the capabilities of the sender
        // ca: fs.readFileSync(`${config.signature}.CA`, "utf8"), //not used, certificate is self-signed
        cert: fs.readFileSync(`${global.appRoot}` + '\\certificates\\certificate.pem', "utf8"),
        key: fs.readFileSync(`${global.appRoot}` + '\\certificates\\key.pem', "utf8"),
        rejectUnauthorized: false
      })
    });

    const authorizationToken = req.header('Token') || ''; //token is encrypted, decrypting it is not a task for SeeChange
    const truYouApi = config.truYou_api;
    if (authorizationToken != '') {
      const truYou_config = {params: {token: authorizationToken}};
      instance.get(truYouApi, truYou_config).catch(err => next(err)).then(response => {

        if (response.status === 200) { //token has been verified
          var username = response.data.username;

          if (username !== undefined || null || '') { //Bad response will not create new documents
            User.findOneAndUpdate( //checking if user has already used SeeChanged (exists in database)
              {username: `${username}`},
              {$setOnInsert: {publicName: `${username}`}}, //if user is new, set public name to username
              {new: true, upsert: true})  // return new doc if one is upserted, upsert a document if it doesnt exist
              .catch(err => next(err)).then(user => {
              console.log(user)
            });
          }
        }
        res.status(response.status).send(response.data); //TruYou will validate the token, SeeChange only redirects the status and data that is given in the response
      });
    } else {
      res.status(401).json({error: "Invalid token"}); //request is denied when a token is not available
    }
  }
};
