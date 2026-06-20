const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Confession = require('./Confession');

const Comment = sequelize.define('Comment', {
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
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'comments', key: 'id' },
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
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { len: [1, 1000] },
  },
}, {
  tableName: 'comments',
  timestamps: true,
  underscored: true,
});

Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId' });
Comment.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Comment.belongsTo(Confession, { as: 'confession', foreignKey: 'confessionId' });

module.exports = Comment;
