const express = require('express');
require('dotenv').config(); // Carga las variables de entorno

const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

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