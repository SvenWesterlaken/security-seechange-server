const Assert = require('supertest');
const io = require('socket.io-client');
const fs = require('fs');
const crypto = require('crypto');
const nock = require('nock');

const pubkeyBob = fs.readFileSync('./test_keys/bob/pubkey.pem');
const privkeyBob = fs.readFileSync('./test_keys/bob/    privkey.pem');

const Chat = require('../models/chatMessage');

describe("Chat test", function() {


    let server,
        options ={
            transports: ['websocket'],
            'force new connection': true
        };

    beforeEach(function (done) {
        // start the server
        server = require('../index').server;

        done();
    });

    afterEach(function (done) {
        Chat.findOneAndRemove({message: "Hello World", username: "Bob", chatroom: "test"})
            .then((response) => {})
            .catch(err => console.log(err));
        done();
    });

    it('can authenticate', (done) => {

        var scope = nock('http://www.example.com')
            .get('/pubkey')
            .reply(200, {"pubkey": pubkeyBob.toString()});

       const client = io.connect('http://localhost:3000', options);

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
       const hash = crypto.createHash('sha256').update("Bob").digest('hex');
       let buffer = new Buffer(hash);
       let cipher = crypto.privateEncrypt(privkeyBob, buffer).toString("base64");
       client.emit("authenticate", "Bob", cipher)
    });

    it('can pass on messages', function(done) {

        var scope = nock('http://www.example.com')
            .get('/pubkey')
            .reply(200, {"pubkey": pubkeyBob.toString()});

        const client = io.connect("http://localhost:3000", options);

        // Connect client to server
        client.once("connect", function () {

            client.once("authenticate", (message) => {

                // Generate message Hash
                const hash = crypto.createHash('sha256').update(username).digest('hex');
                let buffer = new Buffer(hash);
                let msgCipher = crypto.privateEncrypt(privkeyBob, buffer).toString("base64");

                // Generate subscribe has
                const hash2 = crypto.createHash('sha256').update(id).digest('hex');
                let buffer2 = new Buffer(hash2);
                let idCipher = crypto.privateEncrypt(privkeyBob, buffer2).toString("base64");

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

            let id = "test";
            let username = "Bob";



            const authHash = crypto.createHash('sha256').update("Bob").digest('hex');
            let authBuffer = new Buffer(authHash);
            let cipher = crypto.privateEncrypt(privkeyBob, authBuffer).toString("base64");

            client.emit("authenticate", "Bob", cipher);
        });
    })
});