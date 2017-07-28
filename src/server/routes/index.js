const routes = (app, controller) => {
  app.post('/auth/login', controller.user.validateLogin, controller.access.performLogin);
  // add middleware to get details of :userId in url and save it to req.userId
  // add middleware to get details of user from token and save it to req.user
  app.get('/users');
  app.post('/users', controller.user.registerUser);
  app.put('/users/:userId');
  app.get('/users/:userId', controller.access.verifyAuth, controller.role.validateRole('user', 'WRITE'));
  //in role check, if req.user._id === req.userId._id, then no other check
  app.delete('/users/:userId');

  app.get('/users/:userId/meals');
  app.post('/users/:userId/meals');
  app.put('/users/:userId/meals/:mealId');
  app.get('/users/:userId/meals/:mealId');
  app.delete('/users/:userId/meals/:mealId');
};

module.exports = routes;
