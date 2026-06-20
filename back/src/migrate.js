const sequelize = require('./config/database');

async function migrate() {
  const query = sequelize.getQueryInterface();
  const dialect = sequelize.getDialect();

  async function ensureColumn(table, column, typeDef) {
    try {
      const tableInfo = await query.describeTable(table);
      if (!tableInfo[column]) {
        await sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${typeDef};`);
        console.log(`  + columna ${table}.${column} creada`);
      }
    } catch (err) {
      console.error(`  Error con ${table}.${column}:`, err.message);
    }
  }

  console.log('Ejecutando migraciones...');
  await ensureColumn('users', 'bio', 'TEXT');
  await ensureColumn('users', 'banner_color', 'VARCHAR(255)');
  await ensureColumn('confessions', 'is_pinned', 'TINYINT(1) DEFAULT 0');
  console.log('Migraciones completadas.');
}

module.exports = migrate;
