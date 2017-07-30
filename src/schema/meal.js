const _ = require('lodash');

const tableName = 'meals';

const meal = {
  userId: { type: 'string', },
  text: { type: 'string', },
  calories: { type: 'number', minimum: 0 },
  dailyGoal: { type: 'boolean', 'm-default': true },
  date: { type: 'string', pattern: '^([0-9]{4}-[0-9]{2}-[0-9]{2})$'},
  time: { type: 'string', pattern: '^([0-9]{2}:[0-9]{2}:[0-9]{2})$'},
  createdAt: { type: 'string', format: 'date-time', },
  updatedAt: { type: 'string', format: 'date-time', },
};

const postSchema = {
  type: 'object',
  properties: _.omit(meal, 'id'),
  required: ['userId', 'text', 'date', 'time'],
};

const updateSchema = {
  type: 'object',
  properties: _.pick(meal, ['userId', 'calories', 'text', 'date', 'time']),
  additionalProperties: false
};

const querySchema = {
  type: 'object',
  properties: _.omit(meal, ['userId']),
};

module.exports = {
  postSchema,
  updateSchema,
  tableName,
  querySchema,
};
