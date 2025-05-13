/**
 * ===============================================================
 * Nombre del archivo : index.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Inicia el microservicio de ticket.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const express = require('express');
const { connectDatabase } = require('./config/db'); 
const { connectRabbitMQ } = require('./config/rabbitmq');
const { procesarEventosPendientes } = require('./repositories/ticketRepository');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
app.use(express.json());
app.use('/api/tickets', ticketRoutes);

const PORT = process.env.PORT || 3000;

/**
 * Método que se encarga de inicializar el servidor de tickets.
 */
const startServer = async () => {
    await connectDatabase(); 
    await connectRabbitMQ();

    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));

    // 🔄 Verificar eventos en la base de datos cada 5 segundos
    setInterval(async () => {
        console.log("⏳ Ejecutando verificación de eventos...");
        await procesarEventosPendientes();
    }, 10000); // 10000 ms = 10 segundos
};

startServer();
