const Promise = require('bluebird');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const exceptions = require('common/exceptions');
const dateConverter = require('common/helpers/dateConverter');
const NutritionixClient = require('nutritionix');
const config = require('common/config/config');

class Meal {
  constructor(options) {
    this.db = options.db;
    this.schema = new mongoose.Schema(options.schema);
    this.model = this.db.model(options.tableName, this.schema);
    this.jsonSchema = options.jsonSchema;
    this.nutritionix = new NutritionixClient({
      appId: config.nutritionix.id,
      appKey: config.nutritionix.key
    });
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

  queryMeal(input, {page, limit, order, sortby} = {}) {
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

  getConsumedCalorie(input) {
    //{ userId: '', date: '' }
    const currentDate = dateConverter.addDays({ count: 0, date: input.date});
    const query = [
      { $match: { userId: input.userId, date: { $eq: currentDate } } },
      { $group: { _id: null, calories: { $sum: '$calories' } } },
    ];
    return this.model.aggregate(query).then((data) => {
      return (data && data[0]) ? data[0].calories : 0;
    });
  }

  getNutriCalories(food) {
    return this.nutritionix.natural(food).then((data) => {
      return parseInt(_.find(data.results[0].nutrients, {usda_tag: 'ENERC_KCAL' }).value || 0, 10);
    });
  }

  getJsonSchema() {
    return this.jsonSchema;
  }

}

module.exports = Meal;