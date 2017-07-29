const _ = require('lodash');
/**
 * Creates pagination query from input
 *
 */
class Paginator {
  constructor(options) {
    this.queryString = options.queryString;
    this.model = options.model;
    this.schema = options.schema;
  }

  perform() {
    const searchable = _.keys(this.schema.properties);
    _.each(searchable, (key) => {

    })
  }

  addSort() {

  }

  addQuery() {

  }

  addLimit() {

  }

  addSkip() {

  }

}
