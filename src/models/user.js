const Promise = require('bluebird');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

class User {
  constructor(options) {
    this.db = options.db;
    this.schema = new mongoose.Schema(options.schema);
    this.model = this.db.model(options.tableName, this.schema);
    this.salt = options.salt;
  }

  createUser(input) {
    const userInput = _.cloneDeep(input);
    userInput.createdAt = new Date().toISOString();
    userInput.updatedAt = new Date().toISOString();
    userInput.password = this.encryptPasswordString(userInput.password);
    const data = new this.model(userInput);
    return data.save(data);
  }

  updateUser(userId, input) {
    const updatedAt = { updatedAt: new Date().toISOString() };
    return this.model.findByIdAndUpdate(userId, { $set: _.merge(updatedAt, input) }, { new: true });
  }

  deleteUser(userId) {
    return this.model.findByIdAndRemove(userId);
  }

  getUser(userId) {
    return this.model.findById(userId);
  }

  queryUser(input) {
    return new Promise((resolve, reject) => {
      this.model.find(input).find((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    })
  }

  encryptPasswordString(string) {
    return bcrypt.hashSync(string, this.salt).replace(this.salt, '');
  };
}

module.exports = User;