const Assert = require('supertest');
const io = require('socket.io-client');
const fs = require('fs');
const request = require('request');
const crypto = require('crypto');
const env = require('../config/env/env').env;

const pubkeyBob = fs.readFileSync('./test_keys/pubkey_thijsvanmarle.pem');
const privkeyBob = fs.readFileSync('./test_keys/privkey_thijsvanmarle.pem');

const Chat = require('../models/chatMessage');

const username = "thijsvanmarle",
      password = "P@ssword1",
      id = "test";

xdescribe("Chat Integration Test", function() {


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
        let cipher = crypto.privateEncrypt(privkeyBob, buffer).toString("base64");

        //generate options object for request
        const requestOptions = {
            method: 'POST',
            url: env.truYou_api+":"+env.truYou_api_port+"/api/v1/login",
            json: {
                "username": username,
                "password": password
            }
        };

        // Get token via a request
        request(requestOptions, (err, response, body) => {
            if(err) {
                console.log(err);

            }
            let token = body["token"];

            client.emit("authenticate", username, cipher, token)
        })
    });

    it('can pass on messages', function(done) {
        const client = io.connect("http://localhost:" + env.port, options);

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

            const authHash = crypto.createHash('sha256').update(username).digest('hex');
            let authBuffer = new Buffer(authHash);
            let cipher = crypto.privateEncrypt(privkeyBob, authBuffer).toString("base64");
            client.emit("authenticate", username, cipher, id);
        });


    })
});