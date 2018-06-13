const chai = require('chai');
const chai_http = require('chai-http');
const server = require('../../index');
const expect = chai.expect;
const User = require('../../models/user');

chai.use(chai_http);

describe('Modifying user', () => {

  const testUser = new User({
    username: 'streamer1338,',
    publicName: 'streamer1337'
  });

  it('Updating existing user', (done) => {

    User.create(testUser)
      .then((userDb) => {
        userDb.slogan = "BestStreamEver";
        chai.request(server)
          .put(`/api/user/update`)
          .send(userDb)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(202);
            expect(res.body).to.include({msg: "User updated"});
            done();
          });
      });
  });

  it('Updating not existing user', (done) => {

    testUser.slogan = "BestStreamEver";
    chai.request(server)
      .put(`/api/user/update`)
      .send(testUser)
      .end((err, res) => {
        // console.log(res);
        expect(err).to.be.null;
        expect(res).to.have.status(204);
        done();
      });
  });
});

