/**
 * ===============================================================
 * Nombre del archivo : index.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Inicia el microservicio de solicitud.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const express = require('express');
const solicitudRoutes = require('./routes/solicitudRoutes');
const iniciarConsumidor = require('./services/rabbitmqConsumer'); // Importar consumidor
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); // Permitir solicitudes de diferentes dominios
app.use(express.json()); // Permitir recibir JSON en las peticiones

app.use('/api/solicitudes', solicitudRoutes);

/**
 * Inicia el servidor en el puerto especificado.
 */
app.listen(PORT, () => {
    console.log(`🚀 Microservicio de Solicitudes corriendo en http://localhost:${PORT}`);
});

iniciarConsumidor();
