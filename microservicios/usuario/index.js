const express = require('express');
const cors = require('cors');
require('dotenv').config();
const usuarioRoutes = require('./routes/UsuarioRoutes');
const { initializeDatabase } = require('./config/dbConfig');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Permitir solicitudes de diferentes dominios
app.use(express.json()); // Permitir recibir JSON en las peticiones


app.use('/api/usuarios', usuarioRoutes);

app.listen(PORT, () => {
  console.log(`Microservicio de Usuarios corriendo en http://localhost:${PORT}`);
});
