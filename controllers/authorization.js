const config = require('../config/env');
const axios = require('axios');
const fs = require('fs');
const https = require('https');
const User = require('../models/user');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //accept self-signed requests, not needed if certificate is authorized

module.exports = {
//Checking client authorization token on TruYou server
  authorize(req, res, next) {
    var instance = axios.create({
      url: config.truYou_api, //working link to check agent = 'http://httpbin.org/user-agent'
      httpsAgent: new https.Agent({ //user agent is used to act on behalf of SeeChange, it gives extra information to the receiver so it can assess the capabilities of the sender
        // ca: fs.readFileSync(`${config.signature}.CA`, "utf8"), //not used, certificate is self-signed
        cert: fs.readFileSync(`${global.appRoot}` + '\\certificates\\certificate.pem', "utf8"),
        key: fs.readFileSync(`${global.appRoot}` + '\\certificates\\key.pem', "utf8"),
        rejectUnauthorized: false
      })
    });

    const authorizationToken = req.header('Token') || ''; //token is encrypted, decrypting it is not a task for SeeChange
    const username = req.query.username? req.query.username : req.body.username;
    const truYouApi = config.truYou_api;
    if (authorizationToken != '' && username != '') {
      const truYou_config = {params: {token: authorizationToken}};
      instance.post(`${truYouApi}` + '\\verify', truYou_config).catch(err => next(err)).then(response => {
        var tokenUsername = response.data.username;
        if (response.status === 200 && `${tokenUsername}` === `${username}`) { //token has been verified, bad response will not create new documents
          User.findOneAndUpdate( //checking if user has already used SeeChanged (exists in database)
            {username: `${username}`},
            {$setOnInsert: {publicName: `${username}`}}, //if user is new, set public name to username
            {new: true, upsert: true})  // return new doc if one is upserted, upsert a document if it doesnt exist
            .catch(err => next(err)).then(user => {
            console.log(user)
          });
          next();
        } else {
          res.status(401).json({error: "Missing token or username"}); //Token is not verified or username in token and request are not equal
        }
      });
    } else {
      res.status(401).json({error: "Invalid token"}); //request is denied when a token is not available
    }
  }
};
