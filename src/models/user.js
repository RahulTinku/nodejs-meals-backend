const Promise = require('bluebird');

class User {
  constructor(options) {
    this.db = options.db;
    this.schema = options.schema;
    this.model = this.db.model(options.tableName, this.schema)
  }

  createUser(input) {
    const data = new this.model(input);
    return data.save(data);
  }

  updateUser(userId, input) {
    return this.model.findByIdAndUpdate(userId, { $set: input }, { new: true });
  }

  deleteUser(userId, input) {
    return this.model.findByIdAndRemove(userId);
  }

  getUser(userId, input) {
    return this.model.findById(userId );
  }
}

module.exports = User;