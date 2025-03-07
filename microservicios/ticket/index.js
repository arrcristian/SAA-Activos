const express = require('express');
const { connectDatabase } = require('./config/db'); 
const { connectRabbitMQ } = require('./config/rabbitmq');
const { procesarEventosPendientes } = require('./repositories/ticketRepository');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
app.use(express.json());
app.use('/api/tickets', ticketRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDatabase(); 
    await connectRabbitMQ();

    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));

    // 🔄 Verificar eventos en la base de datos cada 5 segundos
    setInterval(async () => {
        console.log("⏳ Ejecutando verificación de eventos...");
        await procesarEventosPendientes();
    }, 5000); // 5000 ms = 5 segundos
};

startServer();
