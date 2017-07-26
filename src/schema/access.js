const _ = require('lodash');

const tableName = 'access';

const user = {
  userId: { type: 'string', pattern: '^([+][0-9]{1,3}[ ]{1}[0-9]{9,10})$', },
  expiresAt: { type: 'string', minLength: 10, },
};

const postSchema = {
  type: 'object',
  properties: _.omit(user, 'id'),
  required: ['userId', 'expiresAt'],
};

module.exports = {
  postSchema,
  tableName,
};
