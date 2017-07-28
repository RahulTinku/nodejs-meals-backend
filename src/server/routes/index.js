const routes = (app, {user, access, role, meal}) => {
  app.get('/vignes/:userId', function (req, res) {
    res.send(req.params)
  })
  app.post('/auth/login', user.validateLogin, access.performLogin);
  app.get('/users');
  app.post('/users', user.registerUser);
  app.put('/users/:userId', access.verifyAuth, user.populateParamsUserId, user.populateTokenUser, role.validateRole('user', 'WRITE'), user.updateUser);
  app.get('/users/:userId', access.verifyAuth, user.populateParamsUserId, user.populateTokenUser, role.validateRole('user', 'WRITE'), user.showUser);
  app.delete('/users/:userId');

  app.get('/users/:userId/meals');
  app.post('/users/:userId/meals');
  app.put('/users/:userId/meals/:mealId');
  app.get('/users/:userId/meals/:mealId');
  app.delete('/users/:userId/meals/:mealId');
};

module.exports = routes;
