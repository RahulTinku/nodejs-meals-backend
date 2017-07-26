class UserNotAuthorized extends Error {
  constructor(message) {
    super(message);
    this.message = 'User Not Authorized';
    this.detail = message;
    this.name = this.constructor.name;
    this.statusCode = 403;
  }
}

module.exports = UserNotAuthorized;
