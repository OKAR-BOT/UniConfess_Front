const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const OtpChallenge = sequelize.define('OtpChallenge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  purpose: {
    type: DataTypes.ENUM('login', 'register'),
    allowNull: false,
    defaultValue: 'login',
  },
  codeHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  consumedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'otp_challenges',
  timestamps: true,
  underscored: true,
});

OtpChallenge.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = OtpChallenge;
