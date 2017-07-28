const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

module.exports = (jsonSchema) => {
  const schema = {};
  const properties = jsonSchema.properties;
  Object.keys(properties).forEach((key) => {
    schema[key] = {
      type: (properties[key].type).capitalize()
    };
    if((jsonSchema.required || []).indexOf(key) > -1) schema[key].required = true;
    if((properties[key]['m-unique'])) {
      schema[key].unique = true;
      schema[key].uniqueCaseInsensitive = true
    }
    if(properties[key]['m-default']) schema[key].default = properties[key]['m-default'];
  });

  return schema;
};