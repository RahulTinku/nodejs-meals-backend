const validator = require('common/helpers/validator');
const _ = require('lodash');
const exceptions = require('common/exceptions');
const stringToQuery = require('common/helpers/stringToQuery');
const Serializer = require('common/serializer');
const config = require('common/config/config');

const serializer = new Serializer();

class MealController {
  constructor(model) {
    this.model = model;
    this.jsonSchema = model.getJsonSchema();
    this.addMeal = this.addMeal.bind(this);
    this.listMeals = this.listMeals.bind(this);
    this.showMeal = this.showMeal.bind(this);
    this.updateMeal = this.updateMeal.bind(this);
    this.removeMeal = this.removeMeal.bind(this);
    this.verifyMealOwner = this.verifyMealOwner.bind(this);
  }

  addMeal(req, res, next) {
    const body = _.merge(req.body, { userId: req.userId.id });
    validator.buildParams({ input: body, schema: this.jsonSchema.postSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.postSchema }))
      .then((input) => {
        if (!input.calories) {
          return this.model.getNutriCalories(input.text)
            .then(calories => _.merge(input, { calories, autoFetch: true, }));
        }
        return input;
      })
      .then(input => this.model.getConsumedCalorie(_.pick(input, ['userId', 'date']))
        .then(consumedCalorie => _.merge(input, {
          dailyGoal: ((consumedCalorie + input.calories) < req.userId.expectedCalories) })))
      .then(input => this.model.addMeal(input))
      .then(result => res.send(serializer.serialize(result, { type: 'meals' })))
      .catch(error => next(error));
  }

  showMeal(req, res, next) {
    this.model.getMeal(req.params.mealId)
      .then(result => res.send(serializer.serialize(result, { type: 'meals' })))
      .catch(error => next(error));
  }

  listMeals(req, res, next) {
    const query = stringToQuery(req.query.filter);
    const searchable = _.keys(this.jsonSchema.querySchema.properties);
    _.each(query.keys, (key) => {
      if (key !== '$or' && key !== '$and' && searchable.indexOf(key) === -1) {
        throw new exceptions.InvalidInput({ message: [`${key} field is not searchable`] });
      }
    });
    const input = typeof (query.query) === 'string' ? JSON.parse(query.query) : query.query;
    input.userId = req.params.userId;
    this.model.queryMeal(input, _.merge({ sortby: 'date,time' }, _.pick(req.query, ['order', 'sortby', 'page', 'limit'])))
      .then((result) => {
        const pagination = { pagination: _.merge({ limit: config.listing.limit }, req.query), type: 'meals' };
        res.send(serializer.serialize(result, pagination));
      })
      .catch(error => next(error));
  }

  updateMeal(req, res, next) {
    const input = _.merge(req.body, { userId: req.userId.id });
    validator.buildParams({ input, schema: this.jsonSchema.updateSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.updateSchema }))
      .then(input => this.model.updateMeal(req.params.mealId, input))
      .then(result => {
        if(result.autoFetch && input.text && !input.calories) {
          return this.model.getNutriCalories(input.text)
            .then(calories => _.merge(input, { calories }))
            .then(updatedInput => this.model.updateMeal(req.params.mealId, updatedInput));
        }
        return result;
      })
      .then(result => res.send(serializer.serialize(result, { type: 'meals' })))
      .catch(error => next(error));
  }

  removeMeal(req, res, next) {
    this.model.deleteMeal(req.params.mealId)
      .then(() => res.status(204).send(serializer.serialize()))
      .catch(error => next(error));
  }

  verifyMealOwner(req, res, next) {
    this.model.getMeal(req.params.mealId)
      .then((result) => {
        if (!result) next(new exceptions.NotFound());
        else if (result.userId !== req.params.userId) next(new exceptions.UnAuthorized());
        else next();
      })
      .catch(error => next(error));
  }
}

module.exports = MealController;
