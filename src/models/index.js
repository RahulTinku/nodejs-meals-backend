const config = require('common/config/config');
const mongooseSchema = require('common/helpers/mongooseSchema');

const User = require('models/user');
const userSchema = require('schema/user');
const Access = require('models/access');
const accessSchema = require('schema/access');

module.exports = (db) => {
  return {
    user: new User({
      db,
      schema: mongooseSchema(userSchema.postSchema),
      tableName: userSchema.tableName,
      salt: config.secret.passwordSalt,
      jsonSchema: userSchema
    }),
    access: new Access({
      db,
      schema: mongooseSchema(accessSchema.postSchema),
      tableName: accessSchema.tableName,
      signature: config.secret.jwtSignature,
      jsonSchema: accessSchema
    })
  };
};