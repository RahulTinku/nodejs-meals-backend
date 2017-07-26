class PasswordMismatch extends Error {
  constructor(message) {
    super(message);
    this.message = 'Password Mismatch';
    this.detail = [{ message: '"password" mismatch' }];
    this.name = this.constructor.name;
    this.statusCode = 403;
  }
}

module.exports = PasswordMismatch;
