const chai = require('chai');
const chai_http = require('chai-http');
const server = require('../../index');
const expect = chai.expect;

chai.use(chai_http);

describe('Client authorization', () => {
  var authorizationToken = "fakeToken";

  it('Token given by client', (done) => {
      chai.request(server)
        .post('/api/authorization')
        .send(authorizationToken)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
    });
  });

  it('No token given', (done) => {
    chai.request(server)
      .get('/api/authorization')
      .end((err, res) => {
        expect(err).to.not.be.null;
        expect(res).to.have.status(401);
        done();
      });
  });
});
