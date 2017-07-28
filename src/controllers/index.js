const UserController = require('controllers/user');
const AccessController = require('controllers/access');
const RoleController = require('controllers/role');

module.exports = (models) => {
  return {
    user: new UserController(models.user),
    access: new AccessController(models.access),
    role: new RoleController(models.role),
  };
};