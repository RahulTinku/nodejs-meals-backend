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
let mealId;
let adminToken;

test.cb.before('it should allow to create a new user', (t) => {
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

test.cb.before('it should allow to activate the account', (t) => {
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
      t.end();
    }).catch(err => console.log(err));
});

test.cb('it should allow user to add a meal', (t) => {
  request
    .post(`/users/${userId}/meals`)
    .set('Authorization', userToken)
    .type('json')
    .send(mealMock)
    .expect('Content-Type', /json/)
    .expect(201)
    .then((res) => {
      t.truthy(res.body.data[0].id);
      mealId = res.body.data[0].id;
      t.end();
    }).catch(err => console.log(err));
});

test.cb('it should allow user to update meal details', (t) => {
  const mealUpdateMock = _.omit(jsf(mealSchema.updateSchema), 'userId');
  request
    .put(`/users/${userId}/meals/${mealId}`)
    .set('Authorization', userToken)
    .type('json')
    .send(mealUpdateMock)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.deepEqual(_.pick(res.body.data[0].attributes, _.keys(mealUpdateMock)), mealUpdateMock);
      t.end();
    });
});

test.cb('it should allow user to view meal details', (t) => {
  request
    .get(`/users/${userId}/meals/${mealId}`)
    .set('Authorization', userToken)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(res.body.data[0].id, mealId));
      t.end();
    });
});

test.cb('it should allow user to list meals belongs to his account', (t) => {
  request
    .get(`/users/${userId}/meals`)
    .set('Authorization', userToken)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(res.body.data[0].id, mealId));
      t.end();
    });
});

test.cb('it should allow user to delete meal belongs to user', (t) => {
  request
    .delete(`/users/${userId}/meals/${mealId}`)
    .set('Authorization', userToken)
    .expect(204, t.end);
});

test.cb('it should allow user to add a meal without calories & calories get auto-calculated', (t) => {
  request
    .post(`/users/${userId}/meals`)
    .set('Authorization', userToken)
    .type('json')
    .send(_.merge({ text: 'salad' }, _.omit(mealMock, ['text', 'calories'])))
    .expect('Content-Type', /json/)
    .expect(202)
    .then((res) => {
      mealId = res.body.data[0].id;
      const afterWait = () => {
        request
          .get(`/users/${userId}/meals/${mealId}`)
          .set('Authorization', userToken)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            t.is(res.body.data[0].attributes.calories, 19);
            t.truthy(_.isEqual(res.body.data[0].id, mealId));
            t.end();
          })
      };
      setTimeout(afterWait, 3000);
    }).catch(err => console.log(err));
});

test.cb('it should allow user to update a meal(calorie auto calculated) & calories get auto-calculated', (t) => {
  request
    .put(`/users/${userId}/meals/${mealId}`)
    .set('Authorization', userToken)
    .type('json')
    .send({ text: 'sugar' })
    .expect('Content-Type', /json/)
    .expect(202)
    .then((res) => {
      const afterWait = () => {
        request
          .get(`/users/${userId}/meals/${mealId}`)
          .set('Authorization', userToken)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            t.is(res.body.data[0].attributes.calories, 16);
            t.truthy(_.isEqual(res.body.data[0].id, mealId));
            t.end();
          })
      };
      setTimeout(afterWait, 3000);
    }).catch(err => console.log(err));
});

test.cb('it should allow admin to add a meal to a user', (t) => {
  request
    .post(`/users/${userId}/meals`)
    .set('Authorization', adminToken)
    .type('json')
    .send(mealMock)
    .expect('Content-Type', /json/)
    .expect(201)
    .then((res) => {
      t.truthy(res.body.data[0].id);
      mealId = res.body.data[0].id;
      t.end();
    });
});

test.cb('it should allow admin to list meals of a user', (t) => {
  request
    .get(`/users/${userId}/meals`)
    .set('Authorization', adminToken)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(res.body.data[1].id, mealId));
      t.end();
    });
});

test.cb('it should allow admin to filter the list results', (t) => {
  request
    .get(`/users/${userId}/meals`)
    .query({ filter: `((date eq ${mealMock.date}) AND (calories gt ${mealMock.calories - 1}))` })
    .set('Authorization', adminToken)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(res.body.data[0].id, mealId));
      t.end();
    });
});

test.cb('it should allow admin to update meal details of a user', (t) => {
  const mealUpdateMock = _.omit(jsf(mealSchema.updateSchema), 'userId');
  request
    .put(`/users/${userId}/meals/${mealId}`)
    .set('Authorization', adminToken)
    .type('json')
    .send(mealUpdateMock)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.deepEqual(_.pick(res.body.data[0].attributes, _.keys(mealUpdateMock)), mealUpdateMock);
      t.end();
    });
});

test.cb('it should allow admin to view meal details of a user', (t) => {
  request
    .get(`/users/${userId}/meals/${mealId}`)
    .set('Authorization', adminToken)
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
      t.truthy(_.isEqual(res.body.data[0].id, mealId));
      t.end();
    });
});

test.cb('it should allow admin to delete meal belongs to user', (t) => {
  request
    .delete(`/users/${userId}/meals/${mealId}`)
    .set('Authorization', adminToken)
    .expect(204, t.end);
});
