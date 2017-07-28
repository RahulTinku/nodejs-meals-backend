const routes = (app, {user, access, role, meal}) => {
  app.post('/auth/login', user.validateLogin, access.performLogin);
  app.get('/users', access.verifyAuth, user.populateTokenUser, role.validateRole('users', 'READ'), user.listUsers);
  app.post('/users', user.registerUser);
  app.put('/users/:userId', access.verifyAuth, user.populateParamsUserId, user.populateTokenUser, role.validateRole('users', 'WRITE'), user.updateUser);
  app.get('/users/:userId', access.verifyAuth, user.populateParamsUserId, user.populateTokenUser, role.validateRole('users', 'READ'), user.showUser);
  app.delete('/users/:userId', access.verifyAuth, user.populateParamsUserId, user.populateTokenUser, role.validateRole('users', 'WRITE'), user.removeUser);

  app.get('/users/:userId/meals', access.verifyAuth, user.populateTokenUser, role.validateRole('meals', 'READ'), meal.listMeals);
  app.post('/users/:userId/meals', access.verifyAuth, user.populateParamsUserId, user.populateTokenUser, role.validateRole('meals', 'WRITE'), meal.addMeal);
  app.put('/users/:userId/meals/:mealId', access.verifyAuth, user.populateParamsUserId, user.populateTokenUser, role.validateRole('meals', 'WRITE'), meal.updateMeal);
  app.get('/users/:userId/meals/:mealId', access.verifyAuth, user.populateParamsUserId, user.populateTokenUser, role.validateRole('meals', 'READ'), meal.showMeal);
  app.delete('/users/:userId/meals/:mealId', access.verifyAuth, user.populateParamsUserId, user.populateTokenUser, role.validateRole('meals', 'WRITE'), meal.removeMeal);
};

module.exports = routes;
