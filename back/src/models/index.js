const sequelize = require('../config/database');
const User = require('./User');
const Confession = require('./Confession');
const Comment = require('./Comment');
const Interaction = require('./Interaction');
const OtpChallenge = require('./OtpChallenge');
const Block = require('./Block');
const Report = require('./Report');

const db = {
  sequelize,
  User,
  Confession,
  Comment,
  Interaction,
  OtpChallenge,
  Block,
  Report,
};

module.exports = db;
