const NutritionixClient = require('nutritionix');
const config = require('common/config/config');
const _ = require('lodash');

const nutritionix = new NutritionixClient({
  appId: config.nutritionix.id,
  appKey: config.nutritionix.key
});

const getCalories = (food) => nutritionix.natural(food).then((data) => {
  return _.find(data.results[0].nutrients, {usda_tag: 'ENERC_KCAL' }).value || 0;
});

module.exports = {
  getCalories
};
