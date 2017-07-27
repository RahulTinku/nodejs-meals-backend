const _ = require('lodash');

const tableName = 'meals';

const user = {
  userId: { type: 'string', },
  text: { type: 'string', },
  calories: { type: 'number', },
  dailyGoal: { type: 'boolean', 'm-default': true},
  datetime: { type: 'string', format: 'date-time', },
  createdAt: { type: 'string', format: 'date-time', },
  updatedAt: { type: 'string', format: 'date-time', },
};

const postSchema = {
  type: 'object',
  properties: _.omit(user, 'id'),
  required: ['userId', 'text', 'datetime'],
};

module.exports = {
  postSchema,
  tableName,
};
