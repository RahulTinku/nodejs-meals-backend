import test from 'ava';
import jsf from 'json-schema-faker';
import supertest from 'supertest';
import { app, dbConnection } from 'server';
import userSchema from 'schema/user';
import _ from 'lodash';
import config from 'common/config/config';

const request = supertest.agent(config.server.host);
const userMock = jsf(userSchema.postSchema);
let userToken;
let userId;
let adminToken;


test.cb('POST /users - it should allow to create a new user', (t) => {
  request
    .post('/users')
    .type('json')
    .send(userMock)
    .expect('Content-Type', /json/)
    .expect(201)
    .then((res) => {
      userId = res.body.data[0].id;
      t.end();
    }).catch(err => console.log(err));
});

test.cb('POST /users - it should allow to activate the account', (t) => {
  dbConnection.getModels().user.getUser(userId).then((userDetails) => {
    request
      .put(`/users/${userId}/activate`)
      .send({ code:  userDetails.verification.code})
      .type('json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        t.is(res.body.data[0].id, userId);
        t.is(res.body.data[0].attributes.status, 'ACTIVE');
        t.end();
      }).catch(err => console.log(err))
  }).catch(err => console.log(err))
});

test.cb('POST /users - it should throw error if exisiting email is used to create account', (t) => {
  request
    .post('/users')
    .type('json')
    .send(userMock)
    .expect('Content-Type', /json/)
    .expect(409, t.end);
});

test.cb('POST /users - it should throw error if email field is missing', (t) => {
  request
    .post('/users')
    .type('json')
    .send(_.omit(userMock, 'email'))
    .expect('Content-Type', /json/)
    .expect(400, t.end);
});

test.cb('POST /users - it should throw error if firstName field is missing', (t) => {
  request
    .post('/users')
    .type('json')
    .send(_.omit(userMock, 'firstName'))
    .expect('Content-Type', /json/)
    .expect(400, t.end);
});

test.cb('POST /users - it should throw error if lastName field is missing', (t) => {
  request
    .post('/users')
    .type('json')
    .send(_.omit(userMock, 'lastName'))
    .expect('Content-Type', /json/)
    .expect(400, t.end);
});


test.cb('POST /users - it should throw error if password field is missing', (t) => {
  request
    .post('/users')
    .type('json')
    .send(_.omit(userMock, 'password'))
    .expect('Content-Type', /json/)
    .expect(400, t.end);
});

test.cb('POST /users - it should throw error if email field is malformed', (t) => {
  request
    .post('/users')
    .type('json')
    .send(_.merge({email: 'abc'}, _.omit(userMock, 'email')))
    .expect('Content-Type', /json/)
    .expect(400, t.end);
});


test.cb('POST /auth/login - it should allow user to login', (t) => {
  request
    .post('/auth/login')
    .type('json')
    .send(_.pick(userMock, ['email', 'password']))
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(res.body.data[0].attributes.access_token);
      userToken = res.body.data[0].attributes.access_token;
      t.end();
    });
});

test.cb('POST /auth/login - it should throw error if email field is missing', (t) => {
  request
    .post('/auth/login')
    .type('json')
    .send(_.pick(userMock, ['password']))
    .expect('Content-Type', /json/)
    .expect(400, t.end)
});

test.cb('POST /auth/login - it should throw error if password field is missing', (t) => {
  request
    .post('/auth/login')
    .type('json')
    .send(_.pick(userMock, ['email']))
    .expect('Content-Type', /json/)
    .expect(400, t.end)
});

test.cb('POST /auth/login - it should throw error if credentials are incorrect', (t) => {
  request
    .post('/auth/login')
    .type('json')
    .send({ email: '1@1.com', password: 'xxxxxxxxxx'})
    .expect('Content-Type', /json/)
    .expect(401, t.end)
});

test.cb('it should allow admin to login', (t) => {
  request
    .post('/auth/login')
    .type('json')
    .send({ email: 'admin@admin.com', password: '1234567890' })
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(res.body.data[0].attributes.access_token);
      adminToken = res.body.data[0].attributes.access_token;
      t.end();
    });
});

test.cb('POST /users - it should allow admin to create a new active user', (t) => {
  request
    .post('/users')
    .type('json')
    .set('Authorization', adminToken)
    .send(jsf(userSchema.postSchema))
    .expect('Content-Type', /json/)
    .expect(201)
    .then((res) => {
      t.is(res.body.data[0].attributes.status, 'ACTIVE');
      t.end();
    });
});

test.cb('it should allow user to view user profile', (t) => {
  request
    .get(`/users/${userId}`)
    .set('Authorization', userToken)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(res.body.data[0].id, userId));
      t.end();
    });
});

test.cb('it should allow user to update user profile', (t) => {
  const userUpdateMock = _.omit(jsf(userSchema.updateSchema), ['email', 'password']);
  request
    .put(`/users/${userId}`)
    .set('Authorization', userToken)
    .type('json')
    .send(userUpdateMock)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(_.pick(res.body.data[0].attributes, _.keys(userUpdateMock)), userUpdateMock));
      t.end();
    });
});

test.cb('it should allow user to update user password', (t) => {
  const userUpdateMock = { old: userMock.password, new: `${Number(Math.random() * 10000000000)}` };
  request
    .put(`/users/${userId}/password`)
    .set('Authorization', userToken)
    .type('json')
    .send(userUpdateMock)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(res.body.data[0].id, userId));
      t.end();
    });
});

test.cb('it should allow user initiate forgot password', (t) => {
  request
    .post('/auth/forgot-password')
    .type('json')
    .send(_.pick(userMock, 'email'))
    .expect('Content-Type', /json/)
    .expect(202, t.end);
});

test.cb('it should allow user reset password', (t) => {
  request
    .post('/auth/reset-password')
    .type('json')
    .send(_.pick(userMock, 'email'))
    .expect('Content-Type', /json/)
    .expect(404, t.end);
});

test.cb('it should allow admin to view user profile', (t) => {
  request
    .get(`/users/${userId}`)
    .set('Authorization', adminToken)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(res.body.data[0].id, userId));
      t.end();
    });
});

test.cb('it should allow admin to update user profile', (t) => {
  const userUpdateMock = _.omit(jsf(userSchema.updateSchema), ['email', 'password']);
  request
    .put(`/users/${userId}`)
    .set('Authorization', adminToken)
    .type('json')
    .send(userUpdateMock)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(_.pick(res.body.data[0].attributes, _.keys(userUpdateMock)), userUpdateMock));
      t.end();
    });
});

test.cb('it should allow admin to list all users', (t) => {
  request
    .get('/users')
    .set('Authorization', adminToken)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(res.body.data.length > 0);
      t.end();
    });
});

test.cb('it should not allow regular user to list users', (t) => {
  request
    .get('/users')
    .set('Authorization', userToken)
    .expect('Content-Type', /json/)
    .expect(401, t.end);
});

test.cb('it should not allow regular user to delete his user account', (t) => {
  request
    .delete(`/users/${userId}`)
    .type('json')
    .set('Authorization', userToken)
    .expect('Content-Type', /json/)
    .expect(401, t.end);
});

test.cb('it should allow admin to delete a user account', (t) => {
  request
    .delete(`/users/${userId}`)
    .type('json')
    .set('Authorization', adminToken)
    .expect(204, t.end);
});
