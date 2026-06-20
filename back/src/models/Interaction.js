const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Confession = require('./Confession');

const Interaction = sequelize.define('Interaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  confessionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: Confession, key: 'id' },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  type: {
    type: DataTypes.ENUM('like', 'repost'),
    allowNull: false,
  },
}, {
  tableName: 'interactions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['confession_id', 'user_id', 'type'],
    },
  ],
});

Interaction.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Interaction.belongsTo(Confession, { as: 'confession', foreignKey: 'confessionId' });

module.exports = Interaction;
