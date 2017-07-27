const routes = (app) => {
  app.post('/auth');
  app.post('/login');

  app.get('/users');
  app.post('/users');
  app.put('/users/:userId');
  app.get('/users/:userId');
  app.delete('/users/:userId');

  app.get('/users/:userId/meals');
  app.post('/users/:userId/meals');
  app.put('/users/:userId/meals/:mealId');
  app.get('/users/:userId/meals/:mealId');
  app.delete('/users/:userId/meals/:mealId');
};

module.exports = routes;
