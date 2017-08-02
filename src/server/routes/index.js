const routes = (app, { user, access, role, meal }) => {
  app.post('/auth/login', user.validateLogin, access.performLogin);
  app.post('/auth/forgot', user.forgotPassword);
  app.post('/auth/reset', user.resetPassword);

  app.get('/users', access.verifyAuth(), user.populateTokenUser(), role.validateRole('users', 'read'), role.getNextLevelRoles, user.listUsers);
  app.post('/users', access.verifyAuth(true), user.populateTokenUser(true), user.registerUser);
  app.put('/users/:userId', access.verifyAuth(), user.populateParamsUserId, user.populateTokenUser(), role.validateRole('users', 'update'), user.updateUser);
  app.put('/users/:userId/activate', user.populateParamsUserId, user.activateUser);
  app.put('/users/:userId/password', access.verifyAuth(), user.populateParamsUserId, user.populateTokenUser(), role.validateRole('users', 'update'), user.updatePassword);
  app.get('/users/:userId', access.verifyAuth(), user.populateParamsUserId, user.populateTokenUser(), role.validateRole('users', 'read'), user.showUser);
  app.delete('/users/:userId', access.verifyAuth(), user.populateParamsUserId, user.populateTokenUser(), role.validateRole('users', 'delete'), user.removeUser);

  app.get('/users/:userId/meals', access.verifyAuth(), user.populateParamsUserId, user.populateTokenUser(), role.validateRole('meals', 'read'), meal.listMeals);
  app.post('/users/:userId/meals', access.verifyAuth(), user.populateParamsUserId, user.populateTokenUser(), role.validateRole('meals', 'write'), meal.addMeal);
  app.put('/users/:userId/meals/:mealId', access.verifyAuth(), user.populateParamsUserId, user.populateTokenUser(), role.validateRole('meals', 'update'), meal.verifyMealOwner, meal.updateMeal);
  app.get('/users/:userId/meals/:mealId', access.verifyAuth(), user.populateParamsUserId, user.populateTokenUser(), role.validateRole('meals', 'read'), meal.verifyMealOwner, meal.showMeal);
  app.delete('/users/:userId/meals/:mealId', access.verifyAuth(), user.populateParamsUserId, user.populateTokenUser(), role.validateRole('meals', 'delete'), meal.verifyMealOwner, meal.removeMeal);
};

module.exports = routes;
