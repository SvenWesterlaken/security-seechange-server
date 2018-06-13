const chai = require('chai');
const chai_http = require('chai-http');
const server = require('../../index');
const expect = chai.expect;

chai.use(chai_http);

describe('Client authorization', () => {
  var authorizationToken = "token123";

  xit('Token given by client', (done) => { //api not available yet
      chai.request(server)
        .post('/api')
        .send(authorizationToken)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
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