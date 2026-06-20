const bcrypt = require('bcryptjs');
const db = require('../models');

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'george@utp.edu.pe';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await db.User.findOne({ where: { email } });
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.User.create({
    email,
    passwordHash,
    displayName: 'George Admin',
    handle: 'george_admin',
    career: 'Ingenieria de Software',
    role: 'admin',
  });
}

module.exports = seedAdmin;
