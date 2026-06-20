const express = require('express');
const cors = require('cors');


require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const confessionRoutes = require('./routes/confessionRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const commentRoutes = require('./routes/commentRoutes');
const db = require('./models');
const seedAdmin = require('./seeders/seed-admin');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/confessions', commentRoutes);
app.use('/api/interactions', interactionRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor corriendo perfectamente' });
});

async function start() {
  try {
    await db.sequelize.sync();
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error('Error al iniciar servidor:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
