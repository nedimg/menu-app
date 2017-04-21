/* global xdescribe, describe, beforeEach, it, xit */

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../src/app');
const User = require('../src/models/user');

// Require the dev-dependencies
const should = chai.should();

chai.use(chaiHttp);

// Our parent block
describe('Users', () => {
    const DUMMY_USER = {
        email: 'email@test.com',
        password: 'password',
    };
    const DUMMY_USER_SOCIAL = {
        email: 'email_social@test.com',
        social: [{ id: 123456789, name: 'Dummy user', provider: 'test' }],
    };
    beforeEach(done => {
        // Before each test we empty the database
        User
            .remove({})
            .then(() => {
                Promise.all([new User(DUMMY_USER).save(), new User(DUMMY_USER_SOCIAL).save()])
                    .then(() => {
                        done();
                    });
            });
    });

    describe('Authentication', () => {
        it('it should create (signup) user and return token', done => {
            const user = {
                email: 'another_email@test.com',
                password: 'password_test',
            };
            chai.request(app)
                .post('/api/auth/signup')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('string');
                    done();
                });
        });

        it('it should not allow signup user with email in use', done => {
            chai.request(app)
                .post('/api/auth/signup')
                .send(DUMMY_USER)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    done();
                });
        });

        it('it should not allow signup user with email in use (ignore case)', done => {
            chai.request(app)
                .post('/api/auth/signup')
                .send({ email: DUMMY_USER.email.toUpperCase(), password: DUMMY_USER.password })
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    done();
                });
        });

        it('it should not allow signup user with short email', done => {
            chai.request(app)
                .post('/api/auth/signup')
                .send({ email: 'short', password: 'password' })
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    done();
                });
        });

        it('it should not allow signup user with short password', done => {
            chai.request(app)
                .post('/api/auth/signup')
                .send({ email: 'test@mail.com', password: 'short' })
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    done();
                });
        });

        it('it should not allow signup user with email in use but return auth providers', done => {
            chai.request(app)
                .post('/api/auth/signup')
                .send({ email: DUMMY_USER_SOCIAL.email, password: 'password' })
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    res.body.providers.should.be.a('array');
                    done();
                });
        });

        it('it should not allow login user with email in use but return auth providers', done => {
            chai.request(app)
                .post('/api/auth/login')
                .send({ email: DUMMY_USER_SOCIAL.email, password: 'password' })
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    res.body.providers.should.be.a('array');
                    done();
                });
        });

        it('it should log in user and return token', done => {
            chai.request(app)
                .post('/api/auth/login')
                .send(DUMMY_USER)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('string');
                    done();
                });
        });

        it('it should log in user and return token (ignore case)', done => {
            chai.request(app)
                .post('/api/auth/login')
                .send({ email: DUMMY_USER.email.toUpperCase(), password: DUMMY_USER.password })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('string');
                    done();
                });
        });

        it('it should not allow log in user with wrong email', done => {
            chai.request(app)
                .post('/api/auth/login')
                .send({ email: 'wrong@test.com', password: 'password_test' })
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    done();
                });
        });

        it('it should not allow log in user with wrong password', done => {
            chai.request(app)
                .post('/api/auth/login')
                .send({ email: 'email@test.com', password: 'wrong_password' })
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    done();
                });
        });
    });

    describe('Users', () => {
        it('it should return users', done => {
            chai.request(app)
                .post('/api/auth/login')
                .send(DUMMY_USER)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('string');
                    chai
                        .request(app)
                        .get('/api/v1/users')
                        .set('x-access-token', res.body)
                        .end((err1, res1) => {
                            res1.should.have.status(200);
                            res1.body.should.be.a('array');
                            done();
                        });
                });
        });

        it('it should set new password', done => {
            chai.request(app)
                .post('/api/auth/login')
                .send(DUMMY_USER)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('string');
                    chai
                        .request(app)
                        .post('/api/v1/users/setPassword')
                        .set('x-access-token', res.body)
                        .send({ password: '1' })
                        .end((err1, res1) => {
                            res1.should.have.status(200);
                            res1.body.should.be.a('object');
                            res1.body.should.have.property('success').eql(true);
                            done();
                        });
                });
        });

        it('it should not return users if valid token not provided', done => {
            chai.request(app)
                .post('/api/auth/login')
                .send(DUMMY_USER)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('string');
                    chai
                        .request(app)
                        .get('/api/v1/users')
                        .end((err1, res1) => {
                            res1.should.have.status(403);
                            res1.body.should.be.a('object');
                            res1.body.should.have.property('success').eql(false);
                            done();
                        });
                });
        });
    });
});
