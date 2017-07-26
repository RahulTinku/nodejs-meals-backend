import test from 'ava';
import jsf from 'json-schema-faker';
import Connection from 'common/database/connection';
import User from 'models/user';
import config from 'common/config/config';
import schema from 'schema/user';
import mongooseSchema from 'common/helpers/mongooseSchema';
import _ from 'lodash';

let dbConnection;
let user;
let mockData = jsf(schema.postSchema);
let userSchema = mongooseSchema(schema.postSchema);
let userId;

test.before.cb('it creates a new database connection', (t) => {
  dbConnection = new Connection(config.database);
  dbConnection.connect().then(() => {
    t.truthy(dbConnection.isConnected());
    user = new User({ db: dbConnection.db, schema: userSchema, tableName: schema.tableName });
    t.end();
  });
});

test.cb('it creates a new user', (t) => {
  user.createUser(_.omit(mockData, 'phone')).then((data) => {
    t.truthy(data.id);
    userId = data.id;
    t.end();
  })
});

test.cb('it updates an user', (t) => {
  const newPhone = '+12 1234567890';
  user.updateUser(userId, { phone: newPhone }).then((data) => {
    t.is(data.phone, newPhone);
    t.end();
  })
});

test.cb('it gets an user', (t) => {
  user.getUser(userId).then((data) => {
    t.is(data.id, userId);
    t.end();
  })
});

test.cb('it deletes an user', (t) => {
  user.deleteUser(userId).then((data) => {
    t.is(data.id, userId);
    t.end();
  })
});

