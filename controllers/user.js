const User = require('../models/user');
const multer = require('multer')
const fs = require('fs');
const dateTime = require('node-datetime');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${appRoot}` + '\\avatars\\') //path where images will be saved
  },
  filename: function (req, file, cb) {
    cb(null, dateTime.create().format('Y-m-d_H-M-S') + '-' + req.body.username + '.png'); //saving image as username + server time
  }
});

const upload = multer({storage: storage}).single('avatar');

module.exports = {

  getInfo(req, res, next) {
    const username = req.query.username || "";
    if (username !== "") {
      User.findOne(
        {username: `${username}`}, {imagePath: 0, _id: 0, __v: 0}) // not all data is requested
        .catch(err => next(err)).then(userDb => {
        if (userDb) {
          res.status(202).json(userDb);
        } else {
          res.status(204).json({error: "User not found"});
        }
      }).catch(next);
    } else {
      res.status(400).json({error: "Missing information needed to fulfill request"})
    }
  },

  getAvatar(req, res, next) {
    const username = req.query.username || "";
    if (username !== "") {
      User.findOne(
        {username: `${username}`}) // information that will not be send
        .catch(err => next(err)).then(userDb => {
        if (userDb) {
          // res.status(202).sendFile(userDb.imagePath);
          res.status(202).json(userDb.imagePath);
        } else {
          res.status(204).json({error: "User not found"});
        }
      }).catch(next);
    } else {
      res.status(400).json({error: "Missing information needed to fulfill request"})
    }
  },

  setPublicName(req, res, next) {
    const username = req.body.username || "";
    const publicName = req.body.publicName || "";
    if (username !== "" && publicName !== "") {
      User.findOneAndUpdate(
        {username: `${username}`}, //username that will be updated
        {$set: {publicName: publicName} }) //information used for updating
        .catch(err => next(err)).then(userDb => {
        if (userDb) { //user exists
          res.status(202).json({msg: "Public name updated"});
        } else {
          res.status(204).json({error: "User not found"});
        }
      }).catch(next);
    } else {
      res.status(400).json({error: "Missing information needed to fulfill request"})
    }
  },

  setSlogan(req, res, next) {
    const username = req.body.username || "";
    const slogan = req.body.slogan || "";
    if (username !== "" && slogan !== "") {
      User.findOneAndUpdate(
        {username: `${username}`}, //username that will be updated
        {$set: {slogan: slogan} }) //information used for updating
        .catch(err => next(err)).then(userDb => {
        if (userDb) { //user exists
          res.status(202).json({msg: "Slogan updated"});
        } else {
          res.status(204).json({error: "User not found"});
        }
      }).catch(next);
    } else {
      res.status(400).json({error: "Missing information needed to fulfill request"})
    }
  },

  setAvatar(req, res, next) {
    try {
      upload(req, res, function (err) {
        const username = req.body.username || "";
        if (username !== "") {
          if (req.file !== undefined) {
            if (err) {
              console.log(err);
              res.status(400).json({error: "Error uploading file."});
            }
            console.log(res.req.file.path);
            var imagePath = res.req.file.path || "";
            if (imagePath !== "") {
              User.findOneAndUpdate(
                {username: `${username}`},
                {$set: {imagePath: imagePath}})
                .catch(err => next(err)).then(user => {
                if (user) {
                  if (user.imagePath) { //removing old avatar if it exists
                    try { //in case it is removed on the server (integrity failure)
                      fs.unlinkSync(user.imagePath);
                    } catch (error) {
                      console.log("Previous file not available on server"); //no other actions need to be taken, filepath will be overwritten
                    }
                  }
                  res.status(202).json({msg: "File uploaded"})
                } else {
                  res.status(204).json({error: "User not found"});
                }
              }).catch(next);
            } else {
              res.status(400).json({error: "Error uploading file"});
            }
          } else {
            res.status(422).json({error: "Invalid file format"});
          }
        } else {
          res.status(400).json({error: "Invalid username"});
        }
      });
    } catch (error) {
      res.status(422).json({error: "Error uploading file"});
      throw error;
    }
  }
};