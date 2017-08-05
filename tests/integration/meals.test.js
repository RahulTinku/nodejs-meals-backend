import test from 'ava';
import jsf from 'json-schema-faker';
import supertest from 'supertest';
import { app, dbConnection } from 'server';
import userSchema from 'schema/user';
import mealSchema from 'schema/meal';
import _ from 'lodash';
import config from 'common/config/config';

const request = supertest.agent(config.server.host);
const userMock = jsf(userSchema.postSchema);
const mealMock = _.merge({ calories: _.random(10, 100) }, jsf(mealSchema.postSchema));
let userToken;
let userId;
let userMealId;
let userAutoCalMealId;
let adminToken;
let adminId;
let umId;
let umToken;
let secondaryUserId;
let secondaryMealId;

test.cb.before('it should create a new user', (t) => {
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

test.cb.before('it should activate user account', (t) => {
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

test.cb.before('it should allow user to login', (t) => {
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
    }).catch(err => console.log(err));
});

test.cb.before('it should allow admin to login', (t) => {
  request
    .post('/auth/login')
    .type('json')
    .send({ email: 'admin@admin.com', password: '1234567890' })
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(res.body.data[0].attributes.access_token);
      adminToken = res.body.data[0].attributes.access_token;
      dbConnection.getModels().access.verifyToken(adminToken).then((tokenDetails) => {
        adminId = tokenDetails.userId;
        t.end();
      })
    }).catch(err => console.log(err));
});

test.cb.before('it should allow user-manager to login', (t) => {
  request
    .post('/auth/login')
    .type('json')
    .send({ email: 'um@um.com', password: '1234567890' })
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(res.body.data[0].attributes.access_token);
      umToken = res.body.data[0].attributes.access_token;
      dbConnection.getModels().access.verifyToken(umToken).then((tokenDetails) => {
        umId = tokenDetails.userId;
        t.end();
      })
    }).catch(err => console.log(err));
});

test.cb.before('it should allow admin to create a new active user', (t) => {
  request
    .post('/users')
    .type('json')
    .set('Authorization', adminToken)
    .send(jsf(userSchema.postSchema))
    .expect('Content-Type', /json/)
    .expect(201)
    .then((res) => {
      t.is(res.body.data[0].attributes.status, 'ACTIVE');
      secondaryUserId = res.body.data[0].id;
      t.end();
    }).catch(err => console.log(err));
});

test.cb('POST /users/:userId/meals - it should allow user to add a meal', (t) => {
  request
    .post(`/users/${userId}/meals`)
    .set('Authorization', userToken)
    .type('json')
    .send(mealMock)
    .expect('Content-Type', /json/)
    .expect(202)
    .then((res) => {
      t.truthy(res.body.data[0].id);
      userMealId = res.body.data[0].id;
      t.end();
    }).catch(err => console.log(err));
});

test.cb('POST /users/:userId/meals - it should allow user to add a meal without calories & calories get auto-calculated', (t) => {
  request
    .post(`/users/${userId}/meals`)
    .set('Authorization', userToken)
    .type('json')
    .send(_.merge({ text: 'salad' }, _.omit(mealMock, ['text', 'calories'])))
    .expect('Content-Type', /json/)
    .expect(202)
    .then((res) => {
      userAutoCalMealId = res.body.data[0].id;
      const afterWait = () => {
        request
          .get(`/users/${userId}/meals/${userAutoCalMealId}`)
          .set('Authorization', userToken)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            t.is(res.body.data[0].attributes.calories, 19);
            t.truthy(_.isEqual(res.body.data[0].id, userAutoCalMealId));
            t.end();
          })
      };
      setTimeout(afterWait, 3000);
    }).catch(err => console.log(err));
});

test.cb('POST /users/:userId/meals - it should allow admin to add a meal to a user', (t) => {
  request
    .post(`/users/${secondaryUserId}/meals`)
    .set('Authorization', adminToken)
    .type('json')
    .send(mealMock)
    .expect('Content-Type', /json/)
    .expect(202)
    .then((res) => {
      t.truthy(res.body.data[0].id);
      secondaryMealId = res.body.data[0].id;
      t.end();
    }).catch(err => console.log(err));
});

test.cb('POST /users/:userId/meals - it should not allow admin to add a meal for admin account', (t) => {
  request
    .post(`/users/${adminId}/meals`)
    .set('Authorization', adminToken)
    .type('json')
    .send(mealMock)
    .expect('Content-Type', /json/)
    .expect(401, t.end);
});

test.cb('POST /users/:userId/meals - it should not allow user-manager to add a meal for user-manager account', (t) => {
  request
    .post(`/users/${umId}/meals`)
    .set('Authorization', umToken)
    .type('json')
    .send(mealMock)
    .expect('Content-Type', /json/)
    .expect(401, t.end);
});

test.cb('POST /users/:userId/meals - it should not allow user-manager to add a meal', (t) => {
  request
    .post(`/users/${userId}/meals`)
    .set('Authorization', umToken)
    .type('json')
    .send(mealMock)
    .expect('Content-Type', /json/)
    .expect(401, t.end);
});

test.cb('POST /users/:userId/meals - it should throw error if required field is missing', (t) => {
  request
    .post(`/users/${userId}/meals`)
    .set('Authorization', userToken)
    .type('json')
    .send(_.omit(mealMock, 'text'))
    .expect('Content-Type', /json/)
    .expect(400, t.end);
});

test.cb('POST /users/:userId/meals - it should throw error if payload is empty', (t) => {
  request
    .post(`/users/${userId}/meals`)
    .set('Authorization', userToken)
    .type('json')
    .send({})
    .expect('Content-Type', /json/)
    .expect(400, t.end);
});

test.cb('POST /users/:userId/meals - it should throw error if Authorization is not sent', (t) => {
  request
    .post(`/users/${userId}/meals`)
    .type('json')
    .send({})
    .expect('Content-Type', /json/)
    .expect(401, t.end);
});

test.cb('POST /users/:userId/meals - it should not allow user to add a meal for other user', (t) => {
  request
    .post(`/users/${secondaryUserId}/meals`)
    .set('Authorization', userToken)
    .type('json')
    .send(mealMock)
    .expect('Content-Type', /json/)
    .expect(401, t.end);
});

test.cb('GET /users/:userId/meals/:mealId - it should allow user to view meal details', (t) => {
  request
    .get(`/users/${userId}/meals/${userMealId}`)
    .set('Authorization', userToken)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(res.body.data[0].id, userMealId));
      t.end();
    }).catch(err => console.log(err));
});

test.cb('GET /users/:userId/meals/:mealId - it should allow admin to view meal details', (t) => {
  request
    .get(`/users/${secondaryUserId}/meals/${secondaryMealId}`)
    .set('Authorization', adminToken)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(res.body.data[0].id, secondaryMealId));
      t.end();
    }).catch(err => console.log(err));
});

test.cb('GET /users/:userId/meals/:mealId - it should not allow user-manager to view meal details', (t) => {
  request
    .get(`/users/${secondaryUserId}/meals/${secondaryMealId}`)
    .set('Authorization', umToken)
    .expect('Content-Type', /json/)
    .expect(401, t.end)
});

test.cb('GET /users/:userId/meals/:mealId - it should not allow user to view other user\'s meal details - Method 1', (t) => {
  request
    .get(`/users/${secondaryUserId}/meals/${secondaryMealId}`)
    .set('Authorization', userToken)
    .expect('Content-Type', /json/)
    .expect(401, t.end);
});

test.cb('GET /users/:userId/meals/:mealId - it should not allow user to view other user\'s meal details - Method 2', (t) => {
  request
    .get(`/users/${userId}/meals/${secondaryMealId}`)
    .set('Authorization', userToken)
    .expect('Content-Type', /json/)
    .expect(401, t.end);
});

test.cb('GET /users/:userId/meals/:mealId - it should throw error is meal does not exist', (t) => {
  request
    .get(`/users/${userId}/meals/598568fcc7ff280275a21e23`)
    .set('Authorization', userToken)
    .expect('Content-Type', /json/)
    .expect(404, t.end);
});

test.cb('GET /users/:userId/meals - it should allow user to list meals belongs to his account', (t) => {
  request
    .get(`/users/${userId}/meals`)
    .set('Authorization', userToken)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(res.body.data[0].attributes.userId, userId));
      t.end();
    }).catch(err => console.log(err));
});

test.cb('GET /users/:userId/meals - it should allow admin to list meals belongs to an user account', (t) => {
  request
    .get(`/users/${secondaryUserId}/meals`)
    .set('Authorization', adminToken)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(res.body.data[0].attributes.userId, secondaryUserId));
      t.end();
    }).catch(err => console.log(err));
});

test.cb('GET /users/:userId/meals - it should allow admin to filter the list results', (t) => {
  request
    .get(`/users/${userId}/meals`)
    .query({ filter: `((date eq ${mealMock.date}) AND (calories gt ${mealMock.calories - 1}))` })
    .set('Authorization', adminToken)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(res.body.data[0].id, userMealId));
      t.end();
    }).catch(err => console.log(err));
});

test.cb('GET /users/:userId/meals - it should not allow user-manager to list meals', (t) => {
  request
    .get(`/users/${secondaryUserId}/meals`)
    .set('Authorization', umToken)
    .expect('Content-Type', /json/)
    .expect(401, t.end);
});

test.cb('GET /users/:userId/meals - it should not allow user to list meals of other user', (t) => {
  request
    .get(`/users/${secondaryUserId}/meals`)
    .set('Authorization', userToken)
    .expect('Content-Type', /json/)
    .expect(401, t.end);
});

test.cb('PUT /users/:userId/meals/:mealId - it should allow user to update meal details', (t) => {
  const mealUpdateMock = _.omit(jsf(mealSchema.updateSchema), 'userId');
  request
    .put(`/users/${userId}/meals/${userMealId}`)
    .set('Authorization', userToken)
    .type('json')
    .send(mealUpdateMock)
    .expect('Content-Type', /json/)
    .expect(202)
    .then((res) => {
      t.deepEqual(_.pick(res.body.data[0].attributes, _.keys(mealUpdateMock)), mealUpdateMock);
      t.end();
    }).catch(err => console.log(err));
});

test.cb('PUT /users/:userId/meals/:mealId - it should allow user to update a meal(calorie auto calculated) & calories get auto-calculated', (t) => {
  request
    .put(`/users/${userId}/meals/${userAutoCalMealId}`)
    .set('Authorization', userToken)
    .type('json')
    .send({ text: 'sugar' })
    .expect('Content-Type', /json/)
    .expect(202)
    .then((res) => {
      const afterWait = () => {
        request
          .get(`/users/${userId}/meals/${userAutoCalMealId}`)
          .set('Authorization', userToken)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            t.is(res.body.data[0].attributes.calories, 16);
            t.truthy(_.isEqual(res.body.data[0].id, userAutoCalMealId));
            t.end();
          }).catch(err => console.log(err));
      };
      setTimeout(afterWait, 3000);
    }).catch(err => console.log(err));
});

test.cb('PUT /users/:userId/meals/:mealId - it should allow admin to update meal details of a user', (t) => {
  const mealUpdateMock = _.omit(jsf(mealSchema.updateSchema), 'userId');
  request
    .put(`/users/${secondaryUserId}/meals/${secondaryMealId}`)
    .set('Authorization', adminToken)
    .type('json')
    .send(mealUpdateMock)
    .expect('Content-Type', /json/)
    .expect(202)
    .then((res) => {
      t.deepEqual(_.pick(res.body.data[0].attributes, _.keys(mealUpdateMock)), mealUpdateMock);
      t.end();
    }).catch(err => console.log(err));
});

test.cb('PUT /users/:userId/meals/:mealId - it should not allow user-manager to update meal details', (t) => {
  const mealUpdateMock = _.omit(jsf(mealSchema.updateSchema), 'userId');
  request
    .put(`/users/${userId}/meals/${secondaryMealId}`)
    .set('Authorization', umToken)
    .type('json')
    .send(mealUpdateMock)
    .expect('Content-Type', /json/)
    .expect(401, t.end);
});

test.cb('PUT /users/:userId/meals/:mealId - it should throw error if input is malformed', (t) => {
  request
    .put(`/users/${userId}/meals/${userMealId}`)
    .set('Authorization', userToken)
    .type('json')
    .send({ date:'1234567' })
    .expect('Content-Type', /json/)
    .expect(400, t.end);
});

test.cb('PUT /users/:userId/meals/:mealId - it should throw error if input is empty', (t) => {
  request
    .put(`/users/${userId}/meals/${userMealId}`)
    .set('Authorization', userToken)
    .type('json')
    .send({})
    .expect('Content-Type', /json/)
    .expect(400, t.end);
});

test.cb('PUT /users/:userId/meals/:mealId - it should throw error if Authorization is not sent', (t) => {
  const mealUpdateMock = _.omit(jsf(mealSchema.updateSchema), 'userId');
  request
    .put(`/users/${userId}/meals/${userMealId}`)
    .type('json')
    .send(mealUpdateMock)
    .expect('Content-Type', /json/)
    .expect(401, t.end);
});

test.cb('PUT /users/:userId/meals/:mealId - it should not allow user to update other user\'s meal details', (t) => {
  const mealUpdateMock = _.omit(jsf(mealSchema.updateSchema), 'userId');
  request
    .put(`/users/${secondaryUserId}/meals/${secondaryMealId}`)
    .set('Authorization', userToken)
    .type('json')
    .send(mealUpdateMock)
    .expect('Content-Type', /json/)
    .expect(401, t.end);
});

test.cb('DELETE /users/:userId/meals/:mealId - it should allow user to delete his meal', (t) => {
  request
    .delete(`/users/${userId}/meals/${userMealId}`)
    .set('Authorization', userToken)
    .expect(204, t.end);
});

test.cb('DELETE /users/:userId/meals/:mealId - it should not allow user to delete meal belongs to other user - Method 1', (t) => {
  request
    .delete(`/users/${userId}/meals/${secondaryMealId}`)
    .set('Authorization', userToken)
    .expect(401, t.end);
});

test.cb('DELETE /users/:userId/meals/:mealId - it should not allow user to delete meal belongs to other user - Method 2', (t) => {
  request
    .delete(`/users/${secondaryUserId}/meals/${secondaryMealId}`)
    .set('Authorization', userToken)
    .expect(401, t.end);
});

test.cb('DELETE /users/:userId/meals/:mealId - it should not allow user-manager to delete meal', (t) => {
  request
    .delete(`/users/${secondaryUserId}/meals/${secondaryMealId}`)
    .set('Authorization', umToken)
    .expect(401, t.end);
});

test.cb('DELETE /users/:userId/meals/:mealId - it should allow admin to delete meal belongs to a user', (t) => {
  request
    .delete(`/users/${secondaryUserId}/meals/${secondaryMealId}`)
    .set('Authorization', adminToken)
    .expect(204, t.end);
});