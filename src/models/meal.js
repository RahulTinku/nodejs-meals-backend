const Promise = require('bluebird');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const exceptions = require('common/exceptions');

class Meal {
  constructor(options) {
    this.db = options.db;
    this.schema = new mongoose.Schema(options.schema);
    this.model = this.db.model(options.tableName, this.schema);
    this.salt = options.salt;
  }

  addMeal(input) {
    const data = _.cloneDeep(input);
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    return (new this.model(data)).save();
  }

  updateMeal(mealId, input) {
    const updatedAt = { updatedAt: new Date().toISOString() };
    return this.model.findByIdAndUpdate(mealId, { $set: _.merge(updatedAt, input) }, { new: true });
  }

  deleteMeal(mealId) {
    return this.model.findByIdAndRemove(mealId);
  }

  getMeal(mealId) {
    return this.model.findById(mealId);
  }

  queryMeal(input) {
    return new Promise((resolve, reject) => {
      this.model.find(input).find((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    })
  }
}

module.exports = Meal;