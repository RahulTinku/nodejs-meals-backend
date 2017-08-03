const validator = require('common/helpers/validator');
const Promise = require('bluebird');
const _ = require('lodash');
const exceptions = require('common/exceptions');

class RoleController {
  /**
   * Initializes Role Controller
   *
   * @param: {
   *  model : model reference
   * }
   */
  constructor(model) {
    this.model = model;
    this.jsonSchema = model.getJsonSchema();
    this.validateRole = this.validateRole.bind(this);
    this.getNextLevelRoles = this.getNextLevelRoles.bind(this);
  }

  /**
   * Fetches subordinate roles for a particular role. Eg: For admin, sub roles are user-manager & user
   *
   * @param req
   * @param res
   * @param next
   */
  getNextLevelRoles(req, res, next) {
    this.model.queryRole({ level: { $gt: req.user.roleLevel } })
      .then((roleData) => {
        req.user.nextLevelRoles = _.map(roleData, 'name');
        next();
      });
  }

  /**
   * Validates if a role has influence on other role to perform a particular a action on its resource(users, meals)
   *
   * @param resource
   * @param action
   */
  validateRole(resource, action) {
    return (req, res, next) => {
      let getUserRole = Promise.resolve();
      let userRoleLevel;
      if (req.userId) {
        getUserRole = getUserRole.then(() => this.model.getRoleByName(req.userId.roles).then(roleData => (userRoleLevel = roleData.level)));
      }

      getUserRole.then(() => {
        const permission = (req.user._id.toString() === (req.userId && req.userId._id.toString())) ? '_.' : '';
        const input = { name: req.user.roles, permissions: `${permission}${resource}.${action}`, level: userRoleLevel };
        return this.model.checkPermission(input)
          .then((result) => {
            if (result && result._id) {
              req.user.roleLevel = result.toObject().level;
              next();
            } else next(new exceptions.UnAuthorized());
          });
      }).catch(error => next(error));
    };
  }
}

module.exports = RoleController;
