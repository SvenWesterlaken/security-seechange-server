const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatMessageSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    chatroom: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timeStamp: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    }
});

const chatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

module.exports = chatMessage;