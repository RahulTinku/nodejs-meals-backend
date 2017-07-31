const moment = require('moment');

const addDays = input => moment(input.date).add(input.count, 'days').format(input.format || 'YYYY-MM-DD');

const addTimeIso = (amount, format) => moment().add(amount, format).toISOString();

const getRandomNumber = (size) => {
  let multipler = 1;
  for (let i = 0; i < size; i += 1) {
    multipler *= 10;
  }
  const result = parseInt(Math.random() * multipler, 10);
  if ((`${result}`).length !== size) return getRandomNumber(size);
  return result;
};

module.exports = {
  addDays,
  addTimeIso,
  getRandomNumber,
};
