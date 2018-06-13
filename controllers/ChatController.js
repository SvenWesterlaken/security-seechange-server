const io = require('../index').io;
const request = require('request');
const crypto = require('crypto');
const fs =require('fs');

const Chat = require('../models/chatMessage');

module.exports = (client) => {
    console.log("[*] Client connected");

    let pubkey; //  = fs.readFileSync('./test_keys/bob/pubkey.pem').toString();
    client.on('authenticate', (username, hash) => {
        // get public key from TruYou server
        request.get('http://www.example.com/pubkey', (err, response, body) => {
            if(err) {
                // If there's an error log it, and notify the user.
                console.log(err);

                client.emit('error', 'couldn\' retreive public key');
                client.disconnect();
                return;
            }

            const o = JSON.parse(body);
            pubkey = o.pubkey.toString();

            // Check Hash
            if(checkHash(hash, username)) {
                client.emit('authenticate', "Success");
            } else {
                client.emit('error', 'Invalid hash');
            }
        })
    });

    // subscribe to room
    client.on('subscribe', (id, hash) => {
        if(checkHash(hash, id)) {
            client.join(id);
        } else {
            client.emit('error', "Incorrect Hash");
        }
    });

    // chat message subject: send a roomID, username and message.
    // then emits it it to all other sockets in the room.
    client.on('chat message', (id, username, msg, hash, timestamp) => {
        if(checkHash(hash, username)) {
            io.to(id).emit('chat message', username, msg, timestamp);
            Chat.create({
                username: username,
                chatroom: id,
                message: msg,
                timeStamp: timestamp,
                hash: hash
            })
                .then((message)=>{})
                .catch(err => console.log(err));
        } else {
            client.emit('error', 'Incorrect Hash');
        }
    });

    // unsubscribe from room
    client.on('unsubscribe', (id, hash) => {
        if(checkHash(hash, id)) {
            client.leave(id);
        } else {
            client.emit('error', "Incorrect Hash");
        }
    });

    function checkHash(encHash, string) {
        // Decrypt hash
        let hash = crypto.publicDecrypt(pubkey, new Buffer(encHash, "base64"));
        // create hash from string
        const newHash = crypto.createHash('sha256').update(string).digest('hex');
        // return check
        return newHash === hash.toString();
    }
};