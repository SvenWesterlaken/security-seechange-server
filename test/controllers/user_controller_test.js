const chai = require('chai');
const chai_http = require('chai-http');
const server = require('../../app');
const expect = chai.expect;
const User = require('../../models/user');
const fs = require('fs');
const config = require('../../config/env');
var mockAdapter = require('axios-mock-adapter');
var axios = require('axios');
chai.use(chai_http);

xdescribe('Modifying user', () => {
  var mock = new mockAdapter(axios);

  mock.onAny(`${config.truYou_api}` + '/verify/streamer1338').reply(200, {
    username: 'streamer1338'
  });

  const testUser = new User({
    username: 'streamer1338',
    publicName: 'streamer1337'
  });

  var authorizationToken = "token123";

  it('Updating user public name successful', (done) => {
    User.create(testUser)
      .then((userDb) => {
        userDb.publicName = "goodstreamer132";
        chai.request(server)
          .put(`/api/user/publicname`)
          .set({Token: `${authorizationToken}`})
          .send(userDb)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(202);
            expect(res.body).to.include({msg: "Public name updated"});
            done();
          });
      });
  });

  it('Updating user slogan unsuccessful', (done) => {
    const testUser = new User({
      username: 'streamer1338',
      publicName: 'streamer1337'
    });
    User.create(testUser)
      .then((userDb) => {
        userDb.slogan = "";
        chai.request(server)
          .put(`/api/user/slogan`)
          .set({Token: `${authorizationToken}`})
          .send(userDb)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.include({error: "Missing information needed to fulfill request"});
            done();
          });
      });
  });
});

xdescribe('Modifying avatar image', () => {

  const testUser = new User({
    username: 'streamer1338',
    publicName: 'streamer1337'
  });

  var authorizationToken = "token123";

  it('Updating existing avatar', (done) => {
    testUser.imagePath = `${appRoot}` + '/avatars/Old_Image'; //set path to old image
    User.create(testUser)
      .then((userDb) => {
        chai.request(server)
          .put(`/api/user/avatar`)
          .set('X-Username', 'streamer1338')
          .set({Token: `${authorizationToken}`})
          .attach('avatar', `${appRoot}` + '/avatars/New_Image', 'New_Image') //image used for uploading
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(202);
            expect(res.body).to.include({msg: "File uploaded"});
            User.findOne({username: testUser.username}).then((user) => { //checking if the file is indeed uploaded
              expect(testUser.imagePath).to.not.equal(user.imagePath); //should not be equal, file is saved as: timestamp + username
            });
            done();
          });
      });
  });

  after((done) => { //cleaning up
    fs.readdir(`${appRoot}` + '/avatars', (err, files) => {
      if (err) throw err;
      for (const file of files) { //remove all files created in tests, except for main image file
        if (file !== 'New_Image') {
          fs.unlink(`${appRoot}` + '/avatars/' + file, (error) => {
            throw error
          });
        }
      }

      fs.writeFileSync(`${appRoot}` + '/avatars/Old_Image', fs.readFileSync(`${appRoot}` + '/avatars/New_Image'), (error) => { //create "Old_Image" for future testing (old image is deleted when a new image is uploaded for a single user)
        throw error
      });
      done();
    });
  });

  it('Inserting invalid avatar', (done) => { //no image = invalid image format
    testUser.imagePath = `${appRoot}` + '/avatars/Old_Image'; //set path to old image
    User.create(testUser)
      .then((userDb) => {
        chai.request(server)
          .put(`/api/user/avatar`)
          .set('X-Username', 'streamer1338')
          .set({Token: `${authorizationToken}`})
          .send({username: userDb.username})
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(422);
            expect(res.body).to.include({error: "Invalid file format"});
            done();
          });
      });
  });
});
