const config = require('common/config/config');
const mongooseSchema = require('common/helpers/mongooseSchema');

const User = require('models/user');
const userSchema = require('schema/user');

module.exports = (db) => {
  return {
    user: new User({
      db,
      schema: mongooseSchema(userSchema.postSchema),
      tableName: userSchema.tableName,
      salt: config.secret.passwordSalt,
    })
  };
};