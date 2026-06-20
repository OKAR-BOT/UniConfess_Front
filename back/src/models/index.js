const sequelize = require('../config/database');
const User = require('./User');
const Confession = require('./Confession');

const db = {
  sequelize,
  User,
  Confession,
};

module.exports = db;
