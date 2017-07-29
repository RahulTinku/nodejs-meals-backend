const Promise = require('bluebird');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const exceptions = require('common/exceptions');
const dateConverter = require('common/helpers/dateConverter');

class Meal {
  constructor(options) {
    this.db = options.db;
    this.schema = new mongoose.Schema(options.schema);
    this.model = this.db.model(options.tableName, this.schema);
    this.jsonSchema = options.jsonSchema;
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

  queryMeal(input, {page, limit, order, sortby}) {
    return new Promise((resolve, reject) => {
      let query =  this.model.find(typeof input === 'string' ? JSON.parse(input) : input);
      if (Number(page) > 0) query = query.skip((limit || config.listing.limit ) * (page - 1));
      if (Number(limit) > 0) query = query.limit(Number(limit));
      if (sortby) {
        const sort = {};
        sort[sortby] = (order === 'asc' ? 1 : -1);
        query = query.sort(sort);
      }
      query.find((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    })
  }

  getConsumedCalorie(input) {
    //{ userId: '', date: '' }
    const nextDate = dateConverter.addDays({ count: 1, date: input.date});
    const query = [
      { $match: { userId: input.userId, datetime: { $gt: input.date, $lte: nextDate } } },
      { $group: { _id: null, calories: { $sum: '$calories' } } },
    ];
    return this.model.aggregate(query).then((data) => {
      return (data && data[0]) ? data[0].calories : 0;
    });
  }

  getJsonSchema() {
    return this.jsonSchema;
  }

}

module.exports = Meal;