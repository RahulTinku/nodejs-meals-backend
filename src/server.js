const express = require('express');
const bodyParser = require('body-parser');
const Connection = require('common/database/connection');
const models = require('models');
const controllers = require('controllers');
const routes = require('server/routes');
const middlewares = require('server/middlewares');
const config = require('common/config/config');
const Serializer = require('common/serializer');

const app = express();
const serializer = new Serializer();
const dbConnection = new Connection(config.database);
let dbModels;
dbConnection.getModels = () => dbModels;

dbConnection.connect().then(() => {
  app.use(bodyParser.json());
  app.all('/*', middlewares.enableCors);
  dbModels = models(dbConnection.db);
  routes(app, controllers(dbModels));

  // If no route is matched by now, it must be a 404
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // Error handler
  app.use((error, req, res, next) => {
    res.status(error.statusCode || 500);
    res.json(serializer.serialize(error));
  });

  // Start the server
  const server = app.listen(config.server.port, (err) => {
    console.log(`Express server listening on port ${server.address().port}`);
  }).on('error', (err) => { });
});

module.exports = {
  app,
  dbConnection
};
