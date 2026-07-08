const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reporterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  reportedUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: User, key: 'id' },
  },
  confessionId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: User, key: 'id' },
  },
}, {
  tableName: 'reports',
  timestamps: true,
  underscored: true,
});

Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

module.exports = Report;
