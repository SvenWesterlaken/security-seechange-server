const Assert = require('supertest');
const io = require('socket.io-client');
const fs = require('fs');
const crypto = require('crypto');
const nock = require('nock');
const env = require('../config/env/env').env;

const pubkey = fs.readFileSync('./test_keys/pubkey_thijsvanmarle.pem');
const privkey = fs.readFileSync('./test_keys/privkey_thijsvanmarle.pem');

const Chat = require('../models/chatMessage');

const username = "thijsvanmarle",
    password = "P@ssword1",
    id = "test";

describe("Chat test", function() {


    let server,
        options ={
            transports: ['websocket'],
            'force new connection': true
        };

    beforeEach(function (done) {
        // start the server
        server = require('../index').server;

        const scope = nock(env.truYou_api, {
            reqheaders: {
                "token": id,
                "host": "localhost"
            }
        })
            .get('/api/v1/login/users/'+username)
            .reply(200, {"publicKey": pubkey.toString()});

        done();
    });

    afterEach(function (done) {
        Chat.findOneAndRemove({message: "Hello World", username: username, chatroom: id})
            .then((response) => {})
            .catch(err => console.log(err));
        done();
    });

    it('can authenticate', (done) => {

       const client = io.connect("http://localhost:" + env.port, options);

       client.once('connect', () => {
            client.once("authenticate", (message) => {
                Assert(message === "Success");

                client.disconnect();
                done();
            });

            client.once("error", (message) => {
                console.log(message);
                Assert(false);

                client.disconnect();
                done();
            })
       });

       // Generate Hash
       const hash = crypto.createHash('sha256').update(username).digest('hex');
       let buffer = new Buffer(hash);
       let cipher = crypto.privateEncrypt(privkey, buffer).toString("base64");
       let token = id;
       client.emit("authenticate", username, cipher, token)
    });

    it('can pass on messages', function(done) {



        const client = io.connect("http://localhost:" + env.port, options);

        // Connect client to server
        client.once("connect", function () {

            client.once("authenticate", (message) => {

                // Generate message Hash
                const hash = crypto.createHash('sha256').update(username).digest('hex');
                let buffer = new Buffer(hash);
                let msgCipher = crypto.privateEncrypt(privkey, buffer).toString("base64");

                // Generate subscribe has
                const hash2 = crypto.createHash('sha256').update(id).digest('hex');
                let buffer2 = new Buffer(hash2);
                let idCipher = crypto.privateEncrypt(privkey, buffer2).toString("base64");

                // subscribe to test room, and send message.
                client.emit("subscribe", id, idCipher );
                client.emit("chat message", id, username, "Hello World", msgCipher, Date.now());
            });

            // Once a chat message comes in validate it. then disconnect
            client.once("chat message", function (user, message) {
                Assert(message === "Hello World");

                client.disconnect();
                done();
            });

            client.once("error", (message) => {
                Assert(false);
                console.log(message);
                client.disconnect();
                done();
            });

            const authHash = crypto.createHash('sha256').update(username).digest('hex');
            let authBuffer = new Buffer(authHash);
            let cipher = crypto.privateEncrypt(privkey, authBuffer).toString("base64");
            let token = id;
            client.emit("authenticate", username, cipher, token);
        });
    })
});