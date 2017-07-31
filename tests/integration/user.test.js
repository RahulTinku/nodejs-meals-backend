import test from 'ava';
import jsf from 'json-schema-faker';
import request from 'supertest';
import app from 'server';
import userSchema from 'schema/user';
import _ from 'lodash';

let userMock = jsf(userSchema.postSchema);
let userToken;
let userId;

test.cb('it should allow to create a new user', (t) => {
  request(app)
    .post('/users')
    .type('json')
    .send(userMock)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      userId = res.body.data[0].id;
      t.end();
    })
});

test.cb('it should allow user to login', (t) => {
  request(app)
    .post('/auth/login')
    .type('json')
    .send(_.pick(userMock, ['email', 'password']))
    .expect('Content-Type', /json/)
    .expect(200)
    .then(res => {
      t.truthy(res.body.data[0].attributes.access_token);
      userToken = res.body.data[0].attributes.access_token;
      t.end();
    })
});

test.cb('it should allow user to update user profile', (t) => {
  let userUpdateMock = _.omit(jsf(userSchema.updateSchema), ['email', 'password']);
  request(app)
    .put(`/users/${userId}`)
    .set('Authorization', userToken)
    .type('json')
    .send(userUpdateMock)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(res => {
      t.truthy(_.isEqual(_.pick(res.body.data[0].attributes, _.keys(userUpdateMock)), userUpdateMock));
      t.end();
    })
});
