const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Confession = sequelize.define('Confession', {
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
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  handle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  career: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'General',
  },
}, {
  tableName: 'confessions',
  timestamps: true,
  underscored: true,
});

User.hasMany(Confession, { foreignKey: 'userId', as: 'confessions' });
Confession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Confession;
