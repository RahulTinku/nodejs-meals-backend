import test from 'ava';
import jsf from 'json-schema-faker';
import Connection from 'common/database/connection';
import Meal from 'models/meal';
import config from 'common/config/config';
import schema from 'schema/meal';
import mongooseSchema from 'common/helpers/mongooseSchema';
import _ from 'lodash';

let dbConnection;
let meal;
let mealId;
let mockData = jsf(schema.postSchema);
mockData.calories = parseInt(Math.random() * 100);
let mealSchema = mongooseSchema(schema.postSchema);

test.before.cb('it creates a new database connection', (t) => {
  dbConnection = new Connection(config.database);
  dbConnection.connect().then(() => {
    t.truthy(dbConnection.isConnected());
    meal = new Meal({
      db: dbConnection.db,
      schema: mealSchema,
      tableName: schema.tableName,
    });
    t.end();
  });
});

test.cb('it adds a new meal for a user', (t) => {
  meal.addMeal(mockData).then((data) => {
    t.truthy(data.id);
    mealId = data.id;
    t.end();
  })
});

test.cb('it updates a meal', (t) => {
  const text = 'xyz';
  meal.updateMeal(mealId, { text }).then((data) => {
    t.is(data.text, text);
    t.end();
  })
});

test.cb('it gets meal details', (t) => {
  meal.getMeal(mealId).then((data) => {
    t.is(data.id, mealId);
    t.end();
  })
});

test.cb('it gets calories consumed for a day', (t) => {
  meal.getConsumedCalorie({
    userId: mockData.userId,
    date: mockData.datetime.split('T')[0],
  }).then((data) => {
    t.is(data, mockData.calories);
    t.end();
  })
});

test.cb('it queries a meal using userId', (t) => {
  meal.queryMeal(_.pick(mockData, 'userId')).then((data) => {
    t.is(data[0].id, mealId);
    t.end();
  })
});

test.cb('it deletes a meal', (t) => {
  meal.deleteMeal(mealId).then((data) => {
    t.is(data.id, mealId);
    t.end();
  })
});
