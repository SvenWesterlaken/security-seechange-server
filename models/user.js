const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    required: true,
    type: String
  },
  publicName: {
    required: true,
    type: String
  },
  slogan: {
    required: false,
    type: String
  },
  imagePath: {
    required: false,
    type: String
  }
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
