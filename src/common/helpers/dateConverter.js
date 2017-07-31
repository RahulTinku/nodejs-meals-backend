const moment = require('moment');

const addDays = input => moment(input.date).add(input.count, 'days').format(input.format || 'YYYY-MM-DD');

module.exports = {
  addDays,
};
