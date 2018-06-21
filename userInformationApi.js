const express = require('express');
const routes = require('./routes/routes');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const db = require('./db/database');
const config = require('./config/env');
const fs = require('fs');
//setting a global path to userInformationApi.js (main file) so it can be used to locate certificates
global.appRoot = path.resolve(__dirname);
if (process.env.NODE_ENV === 'test') {
  appRoot += "/test";
}
// const server = require('http').createServer(app); //insecure
const authority = fs.readFileSync(path.normalize(`${global.appRoot}` + '/certificates/SeeChangeCA.crt'), "utf8");
const certificate = fs.readFileSync(path.normalize(`${global.appRoot}` + '/certificates/SeeChangeCA.crt'), "utf8");
const privateKey = fs.readFileSync(path.normalize(`${global.appRoot}` + '/certificates/SeeChangeCA.key'), "utf8");
const credentials = {key: privateKey, cert: certificate, ca: authority};
const server = require('https').createServer(credentials, app);

app.use(bodyParser.json({limit: '50mb'})); //max file size
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

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

process.env.NODE_ENV !== 'test' ? db.start() : null;
app.use('/api', routes);
app.use("/api/avatars", express.static(__dirname + '/avatars')); //images in avatar directory are accessible directly

server.listen(config.port, () => {
  console.log(`Running on port: ${config.port}`);
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

module.exports = server;