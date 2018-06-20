const chai = require('chai');
const chai_http = require('chai-http');
const path = require('path');
const expect = chai.expect;
const config = require('../../config/env');
var mockAdapter = require('axios-mock-adapter');
var axios = require('axios');
const server = require('../../userInformationApi');

chai.use(chai_http);

describe('Client authorization', () => {

  var mock = new mockAdapter(axios);
  mock.onAny(path.normalize(`${config.truYou_api}` + '/verify/streamer1337')).reply(200, {
    username: 'streamer1337'
  });

  var authorizationToken = "token123";

  it('Token given by client', (done) => {
    const server = require('../../userInformationApi');
    chai.request(server)
      .get('/api')
      .set({Token: `${authorizationToken}`})
      .set('X-Username', 'streamer1337')
      .end((err, res) => {
        expect(err).to.be.null;
        done();
      });
  });

  it('No token provided', (done) => {
    chai.request(server)
      .get('/api')
      .set('X-Username', 'streamer1337')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        done();
      });
  });
});