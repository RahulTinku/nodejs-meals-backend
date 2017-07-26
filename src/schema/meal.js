const _ = require('lodash');

const tableName = 'meals';

const user = {
  userId: { type: 'string', },
  text: { type: 'string', },
  calories: { type: 'number', },
  dailyGoal: { type: 'boolean', 'm-default': true},
  createdAt: { type: 'string', format: 'date-time', },
  updatedAt: { type: 'string', format: 'date-time', },
};

const postSchema = {
  type: 'object',
  properties: _.omit(user, 'id'),
  required: ['userId', 'text', 'calories'],
};

module.exports = {
  postSchema,
  tableName,
};
