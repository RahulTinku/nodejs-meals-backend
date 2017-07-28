const _ = require('lodash');

class Serializer {
  /**
   * Construct a serializer class
   */
  constructor() {
    this.mapping = {
      links: {},
      data: [],
      errors: {},
      meta: {},
      includes: [],
    };
  }

  /**
   * Gives the serializer mapping
   *
   * @returns {{}}
   */
  getMapping() {
    return _.cloneDeep(this.mapping);
  }

  /**
   * Serializes the data according to the JSONAPI Specification (v1.0)
   *
   * @param sourceData
   * @returns {{}}
   */
  serialize(sourceData, sourceUrl, includes) {
    let mapping = this.getMapping();
    const reqUrl = _.isEmpty(sourceUrl) ? {} : sourceUrl;
    if (includes) mapping = _.omit(mapping, 'includes');
    if (sourceData instanceof Error) {
      if (_.isArray(sourceData.detail)) {
        mapping.errors = Serializer.processErrors(sourceData.detail,
          sourceData.message, sourceData.statusCode);
        mapping.meta = {
          errorCount: mapping.errors.length,
        };
      } else {
        mapping.errors = [{
          code: sourceData.message,
          detail: sourceData.detail || '',
          status: sourceData.statusCode,
        }];
        mapping.meta = {
          errorCount: mapping.errors.length,
        };
      }
      return mapping;
    }
    mapping = _.omit(mapping, 'errors');

    if (_.isEmpty(sourceData)) return mapping;

    if (sourceData.Count) {
      mapping.meta = {
        perPage: sourceData.Count,
      };
      mapping.links = {
        next: sourceData.LastEvaluatedKey ? `${reqUrl.url || ''}&next=${Serializer.encode(sourceData.LastEvaluatedKey)}` : '',
        prev: reqUrl.query && reqUrl.query.next ? `${reqUrl.url || ''}&prev=${Serializer.encode(sourceData.FirstEvaluatedKey)}` : '',
      };
    }

    mapping.data = _.map(sourceData.Items || [sourceData], (record) => {
      if (!_.isPlainObject(record)) return {};
      if (record.includes) mapping.includes.push(this.serialize(record.includes, '', true));
      return {
        id: record[Serializer.getId(record)],
        type: record.type || sourceData.type,
        attributes: _.omit(_.values(_.pick(record, '_source'))[0] || record, [Serializer.getId(record), 'password', 'verification', 'includes', 'type']),
        relationships: this.mapRelationShip(record.relationShips || {}),
      };
    });
    return mapping;
  }

  mapRelationShip(relObj) {
    if (_.isEmpty(relObj)) return {};
    const temp = {};
    const keys = _.keys(relObj);
    keys.forEach((item) => {
      temp[item] = this.serialize(relObj[item]);
    });
    return temp;
  }

  /**
   * De-Serializes the serialized data using JSONAPI Specification (v1.0)
   *
   * @param sourceData
   * @returns {{}}
   */
  deserialize(sourceData) {
    this.getMapping();
    let result = {
      Items: [],
    };
    if (!sourceData) return {};
    if (!_.isEmpty(sourceData.links)) {
      if (sourceData.links.next) result.LastEvaluatedKey = sourceData.links.next;
      if (sourceData.meta.perPage) result.Count = sourceData.meta.perPage;
    }
    if (!_.isEmpty(sourceData.data) && _.isArray(sourceData.data)) {
      result.Items = _.map(sourceData.data, record =>
        _.merge(record.attributes, { id: record.id }));
    } else if (!_.isEmpty(sourceData.data) && !_.isArray(sourceData.data)
      && sourceData.data.attributes) {
      const obj = _.merge(sourceData.data.attributes,
        sourceData.data.id ? { id: sourceData.data.id } : {});
      result.Items.push(obj);
    }
    if (!result.Count && !result.LastEvaluatedKey && result.Items.length === 1) {
      result = result.Items[0];
    }
    return result;
  }

  /**
   * Encodes a string to base64 string
   *
   * @param data
   */
  static encode(data) {
    return new Buffer(JSON.stringify(data)).toString('base64');
  }

  /**
   * Decodes a base64 string
   *
   * @param string
   */
  static decode(string) {
    return JSON.parse(new Buffer(string, 'base64').toString('utf8'));
  }

  static getId(params) {
    if (_.keys(params).indexOf('_id') > -1) return '_id';
    return 'id';
  }

  /**
   * Creates a array of errors
   *
   * @param detail
   * @param code
   * @param status
   * @returns {Array}
   */
  static processErrors(detail, code, status) {
    const result = [];
    let includeFieldInDetail = false;
    _.each(detail, (error) => {
      let field = '';
      if (error.message && error.message.indexOf('pattern') === -1 && error.message.split('"').length > 1) {
        field = error.message.split('"')[1];
      } else field = error.property.split('.')[1];
      result.push({
        code,
        detail: error.message,
        source: {
          parameter: field,
        },
        status,
      });
    });
    return result;
  }
}

module.exports = Serializer;
