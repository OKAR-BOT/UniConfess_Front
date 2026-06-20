const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

if (dialect === 'sqlite') {
  const storagePath = process.env.DB_STORAGE || './data/database.sqlite';
  const absPath = path.resolve(__dirname, '..', '..', storagePath);
  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: absPath,
    logging: process.env.NODE_ENV === 'development' ? false : false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'uconfess',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      dialect: dialect,
      logging: false,
    }
  );
}

module.exports = sequelize;
