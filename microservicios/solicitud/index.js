const express = require('express');
const solicitudRoutes = require('./routes/solicitudRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use('/api/solicitudes', solicitudRoutes);

app.listen(PORT, () => {
    console.log(`Microservicio de Solicitudes corriendo en http://localhost:${PORT}`);
});
