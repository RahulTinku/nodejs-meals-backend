const validator = require('common/helpers/validator');
const Promise = require('bluebird');
const _ = require('lodash');
const exceptions = require('common/exceptions');
const stringToQuery = require('common/helpers/stringToQuery');

class MealController {
  constructor(model) {
    this.model = model;
    this.jsonSchema = model.getJsonSchema();
    this.addMeal  = this.addMeal.bind(this);
    this.listMeals  = this.listMeals.bind(this);
    this.showMeal  = this.showMeal.bind(this);
    this.updateMeal  = this.updateMeal.bind(this);
    this.removeMeal  = this.removeMeal.bind(this);
  }

  addMeal(req, res, next) {
    const input = _.merge(req.body, { userId: req.userId.id });
    validator.buildParams({ input, schema: this.jsonSchema.postSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.postSchema }))
      .then((input) => {
        if(!input.calories){
          return this.model.getNutriCalories(input.text).then(calories => _.merge(input, { calories }))
        }
        return input;
      })
      .then(input => {
        return this.model.getConsumedCalorie(_.pick(input, ['userId', 'date']))
          .then((consumedCalorie) => {
            return _.merge(input, { dailyGoal: ((consumedCalorie + input.calories) < req.userId.expectedCalories) });
          })
      })
      .then(input => this.model.addMeal(input))
      .then(result => res.send(result))
      .catch(error => next(error));
  }

  showMeal(req, res, next) {
    this.model.getMeal(req.params.mealId)
      .then(result => res.send(result))
      .catch(error => next(error));
  }

  listMeals(req, res, next) {
    const query = stringToQuery(req.query.filter);
    const searchable = _.keys(this.jsonSchema.querySchema.properties);
    _.each(query.keys, (key) => {
      if(key !== '$or' && key !== '$and' && searchable.indexOf(key) === -1) throw new exceptions.InvalidInput();
    });
    const input = typeof (query.json) === 'string' ? JSON.parse(query.json) : query.json;
    this.model.queryUser(input, _.pick(req.query, ['order', 'sortby', 'page', 'limit']))
      .then(result => res.send(result))
      .catch(error => next(error));
  }

  updateMeal(req, res, next) {
    const input = _.merge(req.body, { userId: req.userId.id });
    validator.buildParams({ input, schema: this.jsonSchema.updateSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.updateSchema }))
      .then(input => this.model.updateMeal(req.params.mealId, input))
      .then(result => res.send(result))
      .catch(error => next(error));
  }

  removeMeal(req, res, next) {
    this.model.deleteMeal(req.params.mealId)
      .then(result => res.send())
      .catch(error => next(error));
  }
}

module.exports = MealController;