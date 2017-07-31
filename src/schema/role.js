const _ = require('lodash');

const tableName = 'roles';

const role = {
  name: { type: 'string', pattern: '^([+][0-9]{1,3}[ ]{1}[0-9]{9,10})$', 'm-unique': true },
  permissions: { type: 'array' },
};

const postSchema = {
  type: 'object',
  properties: _.omit(role, 'id'),
  required: ['name', 'permissions'],
};

module.exports = {
  postSchema,
  tableName,
};
