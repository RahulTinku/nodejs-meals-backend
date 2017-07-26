const _ = require('lodash');

const tableName = 'users';

const user = {
  phone: { type: 'string', pattern: '^([+][0-9]{1,3}[ ]{1}[0-9]{9,10})$', },
  password: { type: 'string', minLength: 10, },
  firstName: { type: 'string', pattern: '^([a-zA-Z]+)$', },
  lastName: { type: 'string', pattern: '^([a-zA-Z]+)$', },
  email: { type: 'string', format: 'email', 'm-unique': true },
  status: { type: 'string', enum: ['GUEST', 'BLOCKED', 'ACTIVE', 'INACTIVE'], },
  expectedCalories: { type: 'number', },
  createdAt: { type: 'string', format: 'date-time', },
  updatedAt: { type: 'string', format: 'date-time', },
};

const postSchema = {
  type: 'object',
  properties: _.omit(user, 'id'),
  required: ['firstName', 'lastName', 'email', 'password'],
};

module.exports = {
  postSchema,
  tableName,
};
