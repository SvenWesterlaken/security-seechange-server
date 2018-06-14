const chai = require('chai');
const chai_http = require('chai-http');
const server = require('../../index');
const expect = chai.expect;
const config = require('../../config/env');
var nock = require('nock');

chai.use(chai_http);

describe('Client authorization', () => {
  var authorizationToken = "token123";

  var truYou_api = nock(config.truYou_api) //not working, nock isnt doing anything...
    .get('/')
    .reply(200, {
      username: 'streamer1337'
    });

  xit('Token given by client', (done) => {
      chai.request(server)
        // console.log(server)
        .get('/api')
        .set({Token: `tokendoesntmatterfortesting`})
        .send(authorizationToken)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.include({username:'streamer1337'});
          done();
    });
  });

  xit('No token given', (done) => {
    chai.request(server)
      .get('/api')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
  });
});