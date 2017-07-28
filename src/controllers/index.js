const UserController = require('controllers/user');
const AccessController = require('controllers/access');

module.exports = (models) => {
  return {
    user: new UserController(models.user),
    access: new AccessController(models.access),
  };
};