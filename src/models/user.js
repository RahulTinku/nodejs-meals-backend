const Promise = require('bluebird');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const exceptions = require('common/exceptions');

class User {
  constructor(options) {
    this.db = options.db;
    this.schema = new mongoose.Schema(options.schema);
    this.model = this.db.model(options.tableName, this.schema);
    this.salt = options.salt;
  }

  createUser(input) {
    const data = _.cloneDeep(input);
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    data.status = 'GUEST';
    data.roles = ['user'];
    data.password = this.encryptPasswordString(data.password);
    return (new this.model(data)).save();
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
    const hash = bcrypt.hashSync(string, this.salt);
    return hash.replace(this.salt, '');
  };

  verifyPassword(passwordToTest, actualPassword) {
    return bcrypt.compareSync(passwordToTest, this.salt + actualPassword);
  }

  verifyLogin(email, password) {
    return this.queryUser({ email }).then((data) => {
      if(data.length === 0) throw new exceptions.NotFound();
      if(!this.verifyPassword(password, data[0].password)) throw new exceptions.PasswordMismatch();
      if(data[0].status !== 'ACTIVE') throw new exceptions.UserNotAuthorized();
      return true;
    });
  }
}

module.exports = User;