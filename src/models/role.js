const Promise = require('bluebird');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

class Role {
  constructor(options) {
    this.db = options.db;
    this.schema = new mongoose.Schema(options.schema);
    this.model = this.db.model(options.tableName, this.schema);
    this.jsonSchema = options.jsonSchema;
  }

  checkPermission(input) {
    /*{
      name: [''], resource: '', onRole: '', action: ''
    }*/
      const query = {
        name: {
          $in: input.name,
        },
        permissions: {
          $elemMatch: {
            resources: input.resource, onRoles: input.onRole, action: input.action,
          }
        }
      };
      return this.model.findOne(query);
  }

  getJsonSchema() {
    return this.jsonSchema;
  }

}

module.exports = Role;