const express = require('express');
const dotenv = require('dotenv');
const ticketRoutes = require('./routes/ticketRoutes');
const ticketService = require('./services/ticketService'); // Importar el servicio

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/api/tickets', ticketRoutes);

app.listen(PORT, () => {
    console.log(`✅ Microservicio de Tickets corriendo en http://localhost:${PORT}`);

    // Ejecutar la verificación automáticamente cada 5 segundos
    setInterval(async () => {
        console.log("🔍 Verificando eventos en la base de datos...");
        await ticketService.checkForTicketEvents();
    }, 5000);
});
