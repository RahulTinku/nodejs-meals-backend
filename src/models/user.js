const Promise = require('bluebird');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const exceptions = require('common/exceptions');
const config = require('common/config/config');
const uniqueValidator = require('mongoose-unique-validator');

class User {
  constructor(options) {
    this.db = options.db;
    this.schema = new mongoose.Schema(options.schema);
    this.schema.plugin(uniqueValidator);
    this.model = this.db.model(options.tableName, this.schema);
    this.salt = options.salt;
    this.jsonSchema = options.jsonSchema;
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

  queryUser(input, {page, limit, order, sortby} = {}) {
    return new Promise((resolve, reject) => {
      let query =  this.model.find(input);
      if (Number(page) > 0) query = query.skip((limit || config.listing.limit ) * (page - 1));
      if (Number(limit) > 0) query = query.limit(Number(limit));
      if (sortby) {
        _.each(sortby.split(','), (sortField) => {
          const sort = {};
          sort[sortField] = (order === 'asc' ? 1 : -1);
          query = query.sort(sort);
        })
      }
      query.find((err, data) => {
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
      //if(data[0].status !== 'ACTIVE') throw new exceptions.UserNotActive();
      return data[0];
    });
  }

  getJsonSchema() {
    return this.jsonSchema;
  }
}

module.exports = User;