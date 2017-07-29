const _ = require('lodash');
const stringToMquery = require('common/helpers/sqlToMongoQuery');
const exceptions = require('common/exceptions');
/**
 * Creates pagination query from input
 *
 */
class Paginator {
  constructor(options) {
    this.stringQuery = options.query.filter ? stringToMquery(options.query.filter) : undefined;
    this.page = options.query.page || 1;
    this.sortBy = options.query.sortBy || 'updatedAt';
    this.limit = options.query.limit || 10;
    this.sortOrder = options.query.order === 'asc' ? 1 : -1;
    this.model = options.model;
    this.schema = options.schema;
  }

  perform() {
    const query = {};
    const searchable = _.keys(this.schema.properties);
    _.each(this,stringQuery.keys, (key) => {
      if(key !== '$or' && key !== '$and' && searchable.indexOf(key) === -1) throw new exceptions.InvalidInput();
    })
    this.model.query
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
