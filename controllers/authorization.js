const config = require('../config/env');
const axios = require('axios');
const fs = require('fs');
const https = require('https');
const User = require('../models/user');
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //accept self-signed requests, not needed if certificate is authorized

module.exports = {
//Checking client authorization token on TruYou server
  authorize(req, res, next) {

    var instance = axios.create({
      url: config.truYou_api, //working link to check agent = 'http://httpbin.org/user-agent'
      httpsAgent: new https.Agent({ //user agent is used to act on behalf of SeeChange, it gives extra information to the receiver so it can assess the capabilities of the sender
        ca: fs.readFileSync(`${global.appRoot}` + '\\certificates\\SeeChangeCA.crt', "utf8"),
        cert: fs.readFileSync(`${global.appRoot}` + '\\certificates\\SeeChangeCA.crt', "utf8"),
        key: fs.readFileSync(`${global.appRoot}` + '\\certificates\\SeeChangeCA.key', "utf8"),
        rejectUnauthorized: false
      })
    });

    const authorizationToken = req.header('Token') || ''; //token is encrypted, decrypting it is not a task for SeeChange
    const username = req.query.username ? req.query.username : (req.body.username ? req.body.username : req.header('X-Username')); //find username in query, body or header(multer usage)

    const truYouApi = config.truYou_api;
    if (authorizationToken != '' && username) {
      const truYou_config = {token: authorizationToken};
      instance.post(`${truYouApi}` + `/verify/${username}`, truYou_config).then(response => {
        var tokenUsername = response.data.username;
        if (response.status === 200 && `${tokenUsername}` === `${username}`) { //token has been verified, bad response will not create new documents
          User.findOneAndUpdate( //checking if user has already used SeeChanged (exists in database)
            {username: `${username}`},
            {$setOnInsert: {publicName: `${username}`}}, //if user is new, set public name to username
            {new: true, upsert: true})  // return new doc if one is upserted, upsert a document if it doesnt exist
            .catch(err => next(err)).then(user => {
            next();
          });
        } else {
          res.status(401).json({error: "Invalid token"}); //Token is not verified or username in token and request are not equal
        }
      }).catch(error => {
        // console.log("truyou error code: " + `${error.response.status}`);
        res.status(401).json({error: "Invalid token"}); //token not validated by TruYou
      });
    } else {
      res.status(400).json({error: "Token or username not provided"}); //request is denied when token or username are not provided
    }
  }
};
