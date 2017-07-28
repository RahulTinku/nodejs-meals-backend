const routes = (app, {user, access, role, meal}) => {
  app.get('/vignes/:userId', function (req, res) {
    res.send(req.params)
  })
  app.post('/auth/login', user.validateLogin, access.performLogin);
  // add middleware to get details of :userId in url and save it to req.userId
  // add function to get details of user from token and save it to req.user
  app.get('/users');
  app.post('/users', user.registerUser);
  app.put('/users/:userId');
  app.get('/users/:userId', access.verifyAuth, user.populateParamsUserId, user.populateTokenUser, role.validateRole('user', 'WRITE'), user.getUser);
  //in role check, if req.user._id === req.userId._id, then no other check
  app.delete('/users/:userId');

  app.get('/users/:userId/meals');
  app.post('/users/:userId/meals');
  app.put('/users/:userId/meals/:mealId');
  app.get('/users/:userId/meals/:mealId');
  app.delete('/users/:userId/meals/:mealId');
};

module.exports = routes;
