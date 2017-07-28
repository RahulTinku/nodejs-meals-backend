const _ = require('lodash');

const tableName = 'meals';

const meal = {
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
  properties: _.omit(meal, 'id'),
  required: ['userId', 'text', 'datetime'],
};

const updateSchema = {
  type: 'object',
  properties: _.pick(meal, ['userId', 'calories', 'text', 'datetime']),
  required: ['userId', 'text', 'datetime'],
};

module.exports = {
  postSchema,
  updateSchema,
  tableName,
};
