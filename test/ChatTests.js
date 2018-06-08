var chai = require('chai');
var mocha = require('mocha');
var Assert = require('supertest');
var io = require('socket.io-client');

describe("Chat test", function() {

    var server,
        options ={
            transports: ['websocket'],
            'force new connection': true
        };

    beforeEach(function (done) {
        // start the server
        server = require('../index').server;

        done();
    });

    it('can pass on messages', function(done) {
        var client = io.connect("http://localhost:3000", options);

        // Connect client to server
        client.once("connect", function () {
            // Once a chat message comes in validate it. then disconnect
            client.once("chat message", function (user, message) {
                Assert(message === "Hello World");

                client.disconnect();
                done();
            });

            // subscribe to test room, and send message.
            client.emit("subscribe", "test");
            client.emit("chat message", "test", "Test user", "Hello World");
        });
    })
})