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
      .then((input) => _.merge(input, { autoFetch: (!input.calories) }))
      .then(input => this.model.addMeal(input))
      .then(result => Promise.all([res.status(result.calories ? 200 : 202).send(serializer.serialize(result, { type: 'meals' })),
        this.updateCaloriesAndDailyGoal({expCal: Number(req.userId.expectedCalories), id: result.id })
      ]))
      .catch(error => next(error));
  }

  updateCaloriesAndDailyGoal(input) {
    // { id(mealId): '', expCal: number }
    return this.model.getMeal(input.id)
      .then((meal) => {
        let updatePromise = Promise.resolve(meal);
        if(meal.autoFetch) {
          updatePromise = updatePromise.then((mealDetails) => {
            return this.model.getNutriCalories(mealDetails.text)
              .then(calories => _.merge(mealDetails, { calories }));
          })
        }
        return updatePromise.then((mealDetails) => {
          return this.model.getConsumedCalorie(_.pick(mealDetails, ['userId', 'date']))
            .then(consumedCalorie => this.model.updateMeal(mealDetails.id, _.merge(_.pick(mealDetails, 'calories'), {
              dailyGoal: ((consumedCalorie + (mealDetails.calories || 0)) < input.expCal)
            })));
        });
      });
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
      .then(input => (input.calories ? _.merge(input, { autoFetch: false }) : input))
      .then(input => this.model.updateMeal(req.params.mealId, input))
      .then(result => Promise.all([res.status(result.autoFetch ? 202 : 200).send(serializer.serialize(result, { type: 'meals' })),
        this.updateCaloriesAndDailyGoal({expCal: Number(req.userId.expectedCalories), id: result.id })
      ]))
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
