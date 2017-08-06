const Connection = require('common/database/connection');
const models = require('models');
const config = require('common/config/config');
const Promise = require('bluebird');
const dbConnection = new Connection(config.database);

const roles = [{
  "name" : "admin",
  "permissions" : [
    "_.users.read", "_.users.write", "_.users.update", "_.users.delete", "meals.read", "meals.write",
    "meals.update", "meals.delete", "users.read", "users.write", "users.update", "users.delete", "roles.write"
  ],
  "level" : 1
},
  {
    "name" : "user-manager",
    "permissions" : [
      "_.users.read", "_.users.write", "_.users.update", "_.users.delete", "users.read", "users.write",
      "users.update", "users.delete"
    ],
    "level" : 2
  }, {
    "name" : "user",
    "permissions" : [
      "_.users.read", "_.users.write", "_.users.update", "_.meals.read", "_.meals.write", "_.meals.update",
      "_.meals.delete"
    ],
    "level" : 3
  }];
const users = [{
    "password" : "1234567890",
    "firstName" : "Admin",
    "lastName" : "A",
    "email" : "admin@admin.com",
    "roles" : "admin",
  }, {
  "password" : "1234567890",
  "firstName" : "UserManager",
  "lastName" : "UM",
  "email" : "um@um.com",
  "roles" : "user-manager",
}];

dbConnection.connect().then(() => {
  const promiseArray = [];
  const dbModels = models(dbConnection.db);
  roles.forEach((role) => promiseArray.push(dbModels.role.addRole(role)));
  users.forEach((user) => promiseArray.push(dbModels.user.createUser(user, true).then((userDetails) => {
    return dbModels.user.updateUser(userDetails.id, {roles: user.roles});
  })));
  return Promise.all(promiseArray);
}).then(() => {
  console.log('Initial populate completed');
  process.exit(1);
}).catch((err) => console.log(err));


