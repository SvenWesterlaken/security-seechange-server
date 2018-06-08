var io = require('../index').io;

module.exports = (client) => {
    console.log("[*] Client connected");

    // subscribe to room
    client.on('subscribe', (id) => {
        var response = client.join(id);
    });

    // chat message subject: send a roomID, username and message.
    // then emits it it to all other sockets in the room.
    client.on('chat message', (id, username, msg) => {
        io.to(id).emit('chat message', username, msg);
    });

    // unsubscribe from room
    client.on('unsubscribe', (id) => {
        client.leave(id);
    });
};