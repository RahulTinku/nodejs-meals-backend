import test from 'ava';
import nutritionix from 'models/nutritionix';

test.cb.skip('it fetches calorie information from nutritionix.com', (t) => {
  nutritionix.getCalories('salad').then((data) => {
    t.is(data, 19);
    t.end();
  })
});
