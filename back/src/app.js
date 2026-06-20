const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config(); // Carga las variables de entorno

const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de la sesión
app.use(session({
  secret: 'clave_para_sesiones',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true 
  }
}));

app.use(cors());

app.use(cors({
  origin: 'http://localhost:3000', // <-- REEMPLAZA ESTO por la URL exacta de tu frontend de React
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middlewares
app.use(express.json()); // Permite a Express entender JSON en las peticiones

// Rutas Base
app.use('/api/users', userRoutes);

// Ruta de prueba de salud del servidor (Health Check)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Servidor corriendo perfectamente' });
});

// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});