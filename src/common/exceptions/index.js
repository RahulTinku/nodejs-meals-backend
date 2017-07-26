const PasswordMismatch = require('common/exceptions/passwordMismatch.error');
const NotFound = require('common/exceptions/notFound.error');
const UserNotAuthorized = require('common/exceptions/userNotAuthorized.error');

module.exports = {
  UserNotAuthorized,
  NotFound,
  PasswordMismatch
};
