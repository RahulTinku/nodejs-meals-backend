const Promise = require('bluebird');
const JsonSchema = require('jsonschema').Validator;
const exceptions = require('common/exceptions');
const _ = require('lodash');

const jsonValidate = new JsonSchema();

const buildParams =({ input, schema, nonEmpty }) => {
  return new Promise((resolve) => {
    const properties = _.keys(schema.properties);
    const params = {};
    properties.forEach((property) => {
      if (input[property]) params[property] = input[property];
      else if (nonEmpty) {
        params[property] = User.getDefaultValue(schema[property]);
      }
    });
    resolve(params);
  });
};

/**
 * Validates the json and its content against the given schema.
 * Throws error if mismatch
 *
 * @param input
 * @param schemaName
 */
const validate = ({ input, schema }) => {
  return new Promise((resolve, reject) => {
    const result = jsonValidate.validate(input, schema);
    if (result.errors && result.errors.length > 0) {
      reject(new exceptions.InvalidInput(result.errors));
    }
    resolve(input);
  });
};

module.exports = {
  validate,
  buildParams,
};