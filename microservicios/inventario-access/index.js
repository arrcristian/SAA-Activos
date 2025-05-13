/**
 * ===============================================================
 * Nombre del archivo : index.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Inicia el microservicio de inventario-access.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const express = require('express');
const cors = require('cors');
const app = express();
const inventarioRoutes = require('./routes/inventarioRoutes');

app.use(express.json());
app.use(cors());
app.use('/api/inventario', inventarioRoutes);

const PORT = process.env.PORT || 3002;

/**
 * Inicia el servidor en el puerto especificado.
 */
app.listen(PORT, () => {
  console.log(`Microservicio de inventario corriendo en el puerto ${PORT}`);
});
