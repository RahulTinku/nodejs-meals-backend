const _ = require('lodash');

const tableName = 'users';

const user = {
  phone: { type: 'string', pattern: '^([+][0-9]{1,3}[ ]{1}[0-9]{9,10})$', },
  password: { type: 'string', minLength: 10, },
  firstName: { type: 'string', pattern: '^([a-zA-Z]+)$', },
  lastName: { type: 'string', pattern: '^([a-zA-Z]+)$', },
  email: { type: 'string', format: 'email', 'm-unique': true },
  status: { type: 'string', enum: ['GUEST', 'ACTIVE', 'BLOCKED'], },
  expectedCalories: { type: 'number', },
  roles: { type: 'string', 'm-default': 'user'},
  createdAt: { type: 'string', format: 'date-time', },
  updatedAt: { type: 'string', format: 'date-time', },
};

const postSchema = {
  type: 'object',
  properties: _.cloneDeep(user),
  required: ['firstName', 'lastName', 'email', 'password'],
};

const loginSchema = {
  type: 'object',
  properties: _.cloneDeep(user),
  required: ['email', 'password'],
};

module.exports = {
  postSchema,
  tableName,
  loginSchema,
};
