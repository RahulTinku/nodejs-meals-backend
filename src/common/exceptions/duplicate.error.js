class DuplicateRecord extends Error {
  constructor(message) {
    super(message);
    this.message = 'Duplicate record found';
    this.detail = message;
    this.name = this.constructor.name;
    this.statusCode = 409;
  }
}

module.exports = DuplicateRecord;
