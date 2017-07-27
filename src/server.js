const express = require('express');
const bodyParser = require('body-parser');
const Connection = require('common/database/connection');
const routes = require('server/routes');
const middlewares = require('server/middlewares');
const config = require('common/config/config');
const models = require('models');
const controllers = require('controllers');
const app = express();

const dbConnection = new Connection(config.database);

dbConnection.connect().then(() => {

  app.use(bodyParser.json());
  app.all('/*', middlewares.enableCors);

  routes(app, controllers(models(dbConnection.db)));

  // If no route is matched by now, it must be a 404
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // Start the server
  const server = app.listen(config.server.port, () => {
    console.log('Express server listening on port ' + server.address().port);
  });
});



