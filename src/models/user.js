const Promise = require('bluebird');
const mongoose = require('mongoose');

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
    return this.model.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(userId) }, { $set: input }, { new: true });
  }

  deleteUser(userId, input) {
    return this.model.findByIdAndRemove({ _id: mongoose.Types.ObjectId(userId) });
  }

  getUser(userId, input) {
    return this.model.findById({ _id: mongoose.Types.ObjectId(userId) });
  }
}

module.exports = User;