const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Block = sequelize.define('Block', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  blockerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  blockedId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
}, {
  tableName: 'blocks',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['blocker_id', 'blocked_id'] },
  ],
});

User.belongsToMany(User, { through: Block, as: 'blocked', foreignKey: 'blockerId', otherKey: 'blockedId' });
User.belongsToMany(User, { through: Block, as: 'blockers', foreignKey: 'blockedId', otherKey: 'blockerId' });

Block.belongsTo(User, { foreignKey: 'blockedId', as: 'blocked' });
Block.belongsTo(User, { foreignKey: 'blockerId', as: 'blocker' });

module.exports = Block;
