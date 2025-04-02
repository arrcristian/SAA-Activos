const express = require('express');
const cors = require('cors');
require('dotenv').config();
const usuarioRoutes = require('./microservicios/usuario/routes/UsuarioRoutes');
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
const solicitudesRoutes = require('./microservicios/solicitud/routes/solicitudRoutes');
>>>>>>> Stashed changes
=======
const solicitudesRoutes = require('./microservicios/solicitud/routes/solicitudRoutes');
>>>>>>> Stashed changes

const app = express();
const PORT = process.env.PORT || 4005;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde "public"
app.use(express.static('public'));

// Rutas del backend
app.use('/api/usuarios', usuarioRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
