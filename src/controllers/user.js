const validator = require('common/helpers/validator');
const Promise = require('bluebird');
const _ = require('lodash');
const exceptions = require('common/exceptions');
const stringToQuery = require('common/helpers/stringToQuery');
const Serializer = require('common/serializer');
const config = require('common/config/config');

const serializer = new Serializer();

class UserController {
  constructor(model) {
    this.model = model;
    this.jsonSchema = model.getJsonSchema();
    this.registerUser  = this.registerUser.bind(this);
    this.validateLogin  = this.validateLogin.bind(this);
    this.listUsers  = this.listUsers.bind(this);
    this.showUser  = this.showUser.bind(this);
    this.updateUser  = this.updateUser.bind(this);
    this.removeUser  = this.removeUser.bind(this);
    this.populateParamsUserId  = this.populateParamsUserId.bind(this);
    this.populateTokenUser  = this.populateTokenUser.bind(this);
  }

  registerUser(req, res, next) {
    const input = _.cloneDeep(req.body);
    validator.buildParams({ input, schema: this.jsonSchema.postSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.postSchema }))
      .then(input => this.model.createUser(input))
      .then(result => res.send(serializer.serialize(result, { type: 'users' })))
      .catch(error => next(error));
  }

  validateLogin(req, res, next) {
    const input = _.cloneDeep(req.body);
    validator.buildParams({ input, schema: this.jsonSchema.loginSchema })
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
      if(key !== '$or' && key !== '$and' && searchable.indexOf(key) === -1) throw new exceptions.InvalidInput();
    });
    const input = typeof (query.query) === 'string' ? JSON.parse(query.query) : query.query;
    input.roles = { $in: req.user.nextLevelRoles };
    this.model.queryUser(input, _.pick(req.query, ['order', 'sortby', 'page', 'limit']))
      .then(result => {
        const pagination = { pagination: _.merge({ limit: config.listing.limit }, req.query), type: 'users' };
        res.send(serializer.serialize(result, pagination))
      })
      .catch(error => next(error));
  }

  updateUser(req, res, next) {
    const input = _.cloneDeep(req.body);
    validator.buildParams({ input, schema: this.jsonSchema.updateSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.updateSchema }))
      .then(input => this.model.updateUser(req.userId._id, input))
      .then(result => res.send(serializer.serialize(result, { type: 'users' })))
      .catch(error => next(error));
  }

  removeUser(req, res, next) {
    this.model.deleteUser(req.userId._id)
      .then(result => res.send(serializer.serialize(result, { type: 'users' })))

      .catch(error => next(error));
  }

  populateParamsUserId (req, res, next) {
    this.model.getUser(req.params.userId).then((userData) => {
      if(!userData) next(new exceptions.NotFound());
      req.userId = userData;
      next();
    }).catch(error => next(error));
  }

  populateTokenUser(req, res, next) {
    this.model.getUser(req.authToken.userId).then((userData) => {
      if(!userData) next(new exceptions.UnAuthorized());
      else {
        req.user = userData;
        next()
      }
    });
  }
}

module.exports = UserController;