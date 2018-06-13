const User = require('../models/user');
const multer = require('multer')
const fs = require('fs');
const dateTime = require('node-datetime');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${appRoot}` + '\\avatars\\') //path where images will be saved
  },
  filename: function (req, file, cb) {
    cb(null, dateTime.create().format('Y-m-d_H-M-S') + '-' + req.body.username); //saving image as username + server time
  }
})

const upload = multer({storage: storage}).single('avatar');

module.exports = {

  update(req, res, next) {
    const username = req.body.username || "";
    if (username !== "") {
      User.findOneAndUpdate(
        {username: `${username}`}, //username that will be updated
        {$set: req.body}) //information used for updating
        .catch(err => next(err)).then(userDb => {
        if (userDb) { //user exists
          res.status(202).json({msg: "User updated"});
        } else {
          res.status(204).json({error: "User not found"});
        }
      }).catch(next);
    }
  },

  setAvatar(req, res, next) {
    upload(req, res, function (err) {
      const username = req.body.username || "";
      // console.log(username);
      if (username !== "") {
        // console.log(req.file);
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
              res.status(202).json("File uploaded")
            } else {
              res.status(204).json({error: "User not found"});
            }
          }).catch(next);
        } else {
          res.status(400).json({error: "Error uploading file"});
        }
      } else {
        res.status(400).json({error: "Invalid username"});
      }
    });
  }
};