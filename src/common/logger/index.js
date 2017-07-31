const bunyan = require('bunyan');

const logger = bunyan.createLogger({ name: 'calorie-backend' });

module.exports = logger;
