/**
 * ===============================================================
 * Nombre del archivo : index.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Inicia el microservicio de Usuario.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const usuarioRoutes = require('./routes/UsuarioRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Permitir solicitudes de diferentes dominios
app.use(express.json()); // Permitir recibir JSON en las peticiones


app.use('/api/usuarios', usuarioRoutes);

/**
 * Inicia el servidor en el puerto especificado.
 */
app.listen(PORT, () => {
  console.log(`Microservicio de Usuarios corriendo en http://localhost:${PORT}`);
});
