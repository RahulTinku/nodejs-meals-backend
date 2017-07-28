const PasswordMismatch = require('common/exceptions/passwordMismatch.error');
const NotFound = require('common/exceptions/notFound.error');
const UserNotAuthorized = require('common/exceptions/userNotAuthorized.error');
const InvalidInput = require('common/exceptions/invalidInput.error');
const UserNotActive = require('common/exceptions/userNotActive.error');

module.exports = {
  UserNotActive,
  InvalidInput,
  UserNotAuthorized,
  NotFound,
  PasswordMismatch
};
