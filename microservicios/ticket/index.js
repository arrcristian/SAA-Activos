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
    try {
        await connectDatabase(); 
        await connectRabbitMQ();

        app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));

        setInterval(async () => {
            try {
                console.log("⏳ Ejecutando verificación de eventos...");
                await procesarEventosPendientes();
            } catch (err) {
                console.error("❌ Error al procesar eventos pendientes:", err);
            }
        }, 10000);

    } catch (error) {
        console.error("❌ Error crítico al iniciar el servidor:", error);
    }
};

startServer();
