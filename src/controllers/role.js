const validator = require('common/helpers/validator');
const Promise = require('bluebird');
const _ = require('lodash');
const exceptions = require('common/exceptions');

class RoleController {
  constructor(model) {
    this.model = model;
    this.jsonSchema = model.getJsonSchema();
    this.validateRole  = this.validateRole.bind(this);
  }

  validateRole(resource, action) {
    return (req, res, next) => {
      if(req.user._id.toString() === (req.userId && req.userId._id.toString())) next();
      else {
        const input = { name: [req.user.roles], resource, onRole: (req.userId || {}).role || 'user', action };
        this.model.checkPermission(input)
          .then(result => {
            if(result && result._id) next();
            else next(new exceptions.UnAuthorized())
          })
          .catch(error => next(error));
      }
    }
  }
}

module.exports = RoleController;