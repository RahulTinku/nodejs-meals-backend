const validator = require('common/helpers/validator');
const _ = require('lodash');
const Promise = require('bluebird');
const exceptions = require('common/exceptions');
const stringToQuery = require('common/helpers/stringToQuery');
const Serializer = require('common/serializer');
const config = require('common/config/config');
const uuid = require('uuid/v4');
const dateConverter = require('common/helpers/dateConverter');
const mailer = require('common/mailer');

const serializer = new Serializer();

class UserController {
  constructor(model) {
    this.model = model;
    this.jsonSchema = model.getJsonSchema();
    this.registerUser = this.registerUser.bind(this);
    this.validateLogin = this.validateLogin.bind(this);
    this.listUsers = this.listUsers.bind(this);
    this.showUser = this.showUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.removeUser = this.removeUser.bind(this);
    this.populateParamsUserId = this.populateParamsUserId.bind(this);
    this.populateTokenUser = this.populateTokenUser.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  registerUser(req, res, next) {
    const body = _.cloneDeep(req.body);
    validator.buildParams({ input: body, schema: this.jsonSchema.postSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.postSchema }))
      .then(input => this.model.createUser(input))
      .then(result => Promise.all([res.send(serializer.serialize(result, { type: 'users' })),
        mailer({to: result.email, userDetails: _.pick(result, 'firstName'), template: 'newUser'})]))
      .catch(error => next(error));
  }

  validateLogin(req, res, next) {
    const body = _.cloneDeep(req.body);
    validator.buildParams({ input: body, schema: this.jsonSchema.loginSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.loginSchema }))
      .then(input => this.model.verifyLogin(input.email, input.password))
      .then(result => (req.user = result))
      .then(() => next())
      .catch(error => next(error));
  }

  showUser(req, res, next) {
    this.model.getUser(req.params.userId)
      .then(result => res.send(serializer.serialize(result, { type: 'users' })))
      .catch(error => next(error));
  }

  listUsers(req, res, next) {
    const query = stringToQuery(req.query.filter);
    const searchable = _.keys(this.jsonSchema.querySchema.properties);
    _.each(query.keys, (key) => {
      if (key !== '$or' && key !== '$and' && searchable.indexOf(key) === -1) throw new exceptions.InvalidInput();
    });
    const input = typeof (query.query) === 'string' ? JSON.parse(query.query) : query.query;
    input.roles = { $in: req.user.nextLevelRoles };
    this.model.queryUser(input, _.merge({ sortby: 'updatedAt' }, _.pick(req.query, ['order', 'sortby', 'page', 'limit'])))
      .then((result) => {
        const pagination = { pagination: _.merge({ limit: config.listing.limit }, req.query), type: 'users' };
        res.send(serializer.serialize(result, pagination));
      })
      .catch(error => next(error));
  }

  updateUser(req, res, next) {
    const body = _.cloneDeep(req.body);
    validator.buildParams({ input: body, schema: this.jsonSchema.updateSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.updateSchema }))
      .then(input => this.model.updateUser(req.userId._id, input))
      .then(result => res.send(serializer.serialize(result, { type: 'users' })))
      .catch(error => next(error));
  }

  updatePassword(req, res, next) {
    const body = _.cloneDeep(req.body);
    validator.buildParams({ input: body, schema: this.jsonSchema.updatePasswordSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.updatePasswordSchema }))
      .then(input => Promise.all([this.model.verifyLogin(req.userId.email, input.old), input]))
      .spread((data, input) => this.model.updateUser(req.userId._id, { password: input.new }))
      .then(result => res.send(serializer.serialize(result, { type: 'users' })))
      .catch(error => next(error));
  }

  forgotPassword(req, res, next) {
    const body = _.cloneDeep(req.body);
    validator.buildParams({ input: body, schema: this.jsonSchema.forgotPasswordSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.forgotPasswordSchema }))
      .then(input => this.model.queryUser(input))
      .then((result) => {
        if (result && result[0]) {
          const code = uuid();
          const input = { verification: { code, expiry: dateConverter.addTimeIso(15, 'm'), attempts: 0, resendAttempt: 0 } };
          return this.model.updateUser(result[0]._id, input);
        }
        throw new exceptions.NotFound();
      })
      .then(result => Promise.all([res.status(202).send(serializer.serialize()),
        mailer({to: result.email, userDetails: {
        firstName: result.firstName, code: result.verification.code }, template: 'forgotPassword'})]))
      .catch(error => next(error));
  }

  resetPassword(req, res, next) {
    const body = _.cloneDeep(req.body);
    validator.buildParams({ input: body, schema: this.jsonSchema.resetPasswordSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.resetPasswordSchema }))
      .then(input => this.model.queryUser({ 'verification.code': input.code, email: input.email }))
      .then((result) => {
        if (result && result[0]) {
          const code = uuid();
          const input = { verification: {}, password: dateConverter.getRandomNumber(10).toString() };
          return this.model.updateUser(result[0]._id, input);
        }
        throw new exceptions.NotFound();
      })
      .then(result => res.send(serializer.serialize()))
      .catch(error => next(error));
  }

  removeUser(req, res, next) {
    this.model.deleteUser(req.userId._id)
      .then(result => res.status(204).send(serializer.serialize(result, { type: 'users' })))
      .catch(error => next(error));
  }

  populateParamsUserId(req, res, next) {
    this.model.getUser(req.params.userId).then((userData) => {
      if (!userData) next(new exceptions.NotFound());
      req.userId = userData;
      next();
    }).catch(error => next(error));
  }

  populateTokenUser(req, res, next) {
    this.model.getUser(req.authToken.userId).then((userData) => {
      if (!userData) next(new exceptions.UnAuthorized());
      else {
        req.user = userData;
        next();
      }
    });
  }
}

module.exports = UserController;
