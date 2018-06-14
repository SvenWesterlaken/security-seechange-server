const express = require('express');
const routes = require('./routes/routes');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const env = require('./config/env/env').env;
mongoose.Promise = global.Promise;
const connection = require('./config/mongo.db');
// Create http server, and pass it to socket.io
const server = require('http').createServer(app);
module.exports.io = require('socket.io')(server);
const chatController = require('./controllers/ChatController');

// Send all socket connections to chat controller
module.exports.io.on('connect', chatController);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

routes(app);

server.listen(env.port, function (err) {
    if (err) throw err;
    console.log('\n' +
        '            :+@@@                                                       \n' +
        '         #@@@@@@@.                                                      \n' +
        '       @@@@+.  ,@.                                                      \n' +
        '     ,@@@`     ,@.                                                      \n' +
        '    ;@@,       ,@.                                                      \n' +
        '   :@@         ,@.                                                      \n' +
        '   @@          `@`                                                      \n' +
        '  @@`                                                                   \n' +
        ' ,@#            +                                                       \n' +
        ' @@            @@@                                                      \n' +
        ' @@           @@`@@         @@#            \'@@` @`                      \n' +
        '.@:          @@  `@@       @+ #@          :@ .@ @`                      \n' +
        '\'@`         @@  : `@@      @@    @@@` @@@ @;  . @@@@ #@@# @@@# @@@@ +@@#\n' +
        '#@         @@  @@@ `@@      +@@ ;@ \'### #;@:    @` @   .@ @ `@ @  @ @  @\n' +
        '#@         @@  @@@ `@@     ,  +@+@++\'@#++;@\'  \'`@` @ @\',@ @ `@ @  @ @+++\n' +
        '\'@`         @@  : `@@      @#.@#`@,;.:@.+`,@,\'@ @` @ @:+@ @ `@ @;;@ @#.@\n' +
        '.@:          @@  `@@        ;#;  .#\'  ,#;  .#\'  +` + .#.+ + `+ `#,@  \'+`\n' +
        ' @@           @@`@@                                            @+@@     \n' +
        ' @@            @@@                                              ,.      \n' +
        ' ,@#            +                                                       \n' +
        '  @@`                                                                   \n' +
        '   @@          `@`                                                      \n' +
        '   :@@         ,@.                                                      \n' +
        '    ;@@,       ,@.                                                      \n' +
        '     ,@@@`     ,@.                                                      \n' +
        '       @@@@+.  ,@.                                                      \n' +
        '         #@@@@@@@.                                                      \n' +
        '            :+@@@                                                       \n' +
        '\n')
});

module.exports = {
    server
};

