const Promise = require('bluebird');
const mongoose = require('mongoose');

class Role {
  /**
   * Initializes Role model
   *
   * @param: {
   *  db : database reference
   *  schema: mongoose schema
   *  signature: jwt signature
   *  jsonSchema: original jsonSchemas for the model
   * }
   */
  constructor(options) {
    this.db = options.db;
    this.schema = new mongoose.Schema(options.schema);
    this.model = this.db.model(options.tableName, this.schema);
    this.jsonSchema = options.jsonSchema;
  }

  /**
   * Fetches role record by name
   *
   * @param input
   * @returns {*|Promise}
   */
  getRoleByName(input) {
    return this.model.findOne({ name: input });
  }

  /**
   * Queries role using the given query
   *
   * @param input
   * @returns {*|Promise}
   */
  queryRole(input) {
    return new Promise((resolve, reject) => {
      this.model.find(input).find((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  /**
   * Validates the permission for given role(name) & permissions needed with level
   *
   * @param name
   * @param permissions
   * @param level
   * @returns {*|Promise}
   */
  checkPermission({ name, permissions, level }) {
    const query = {
      name,
      permissions,
    };
    if (level) query.level = { $lt: level };
    return this.model.findOne(query);
  }

  /**
   * Returns the JSON schema of this table
   *
   * @returns {*}
   */
  getJsonSchema() {
    return this.jsonSchema;
  }
}

module.exports = Role;
