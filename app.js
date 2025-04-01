const express = require('express');
const cors = require('cors');
require('dotenv').config();
const usuarioRoutes = require('./microservicios/usuario/routes/UsuarioRoutes');
const solicitudesRoutes = require('./microservicios/solicitud/routes/SolicitudRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde "public"
app.use(express.static('public'));

// Rutas del backend
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
