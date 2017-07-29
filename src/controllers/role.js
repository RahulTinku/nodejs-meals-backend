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
      let getUserRole = Promise.resolve();
      let userRoleLevel;
      if(req.userId) {
        getUserRole = getUserRole.then(() => {
          return this.model.getRoleByName(req.userId.roles).then(roleData => (userRoleLevel = roleData.level));
        })
      }

      getUserRole.then(() => {
        const permission = (req.user._id.toString() === (req.userId && req.userId._id.toString())) ? '_.' : '';
        const input = { name: req.user.roles, permissions: `${permission}${resource}.${action}`, level: userRoleLevel };
        return this.model.checkPermission(input)
          .then(result => {
            if(result && result._id) next();
            else next(new exceptions.Forbidden())
          })
      }).catch(error => next(error));

      /*if(req.user._id.toString() === (req.userId && req.userId._id.toString())) next();
      else {
        const input = { name: [req.user.roles], resource, onRole: (req.userId || {}).role || 'user', action };
        this.model.checkPermission(input)
          .then(result => {
            if(result && result._id) next();
            else next(new exceptions.UnAuthorized())
          })
          .catch(error => next(error));
      }*/
    }
  }
}

module.exports = RoleController;