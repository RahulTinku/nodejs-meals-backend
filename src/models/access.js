const Promise = require('bluebird');
const _ = require('lodash');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

class Access {
  constructor(options) {
    this.db = options.db;
    this.schema = new mongoose.Schema(options.schema);
    this.model = this.db.model(options.tableName, this.schema);
    this.signature = options.signature;
    this.jsonSchema = options.jsonSchema;
  }

  createAccessLog(input) {
    const data = _.cloneDeep(input);
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    return (new this.model(data)).save();
  }

  updateAccessLog(id, input) {
    const updatedAt = { updatedAt: new Date().toISOString() };
    return this.model.findByIdAndUpdate(id, { $set: _.merge(updatedAt, input) }, { new: true });
  }

  getAccessLog(id) {
    return this.model.findById(id);
  }

  queryAccessLog(input) {
    return new Promise((resolve, reject) => {
      this.model.find(input).find((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  createJwtToken(input) {
    return new Promise((resolve) => {
      const token = {
        userId: input.userId,
        id: input._id,
      };
      resolve({ access_token: jwt.sign(token, this.signature, { expiresIn: '1 days' }) });
    });
  }

  verifyToken(token) {
    return new Promise((resolve) => {
      resolve(jwt.verify(token, this.signature));
    });
  }

  getJsonSchema() {
    return this.jsonSchema;
  }
}

module.exports = Access;
