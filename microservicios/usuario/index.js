const express = require('express');
const cors = require('cors');
require('dotenv').config();
const usuarioRoutes = require('./routes/UsuarioRoutes');
const db = require('./config/dbConfig');

const app = express();

// Middlewares
app.use(cors()); // Permitir solicitudes de diferentes dominios
app.use(express.json()); // Permitir recibir JSON en las peticiones


app.use('/api/usuarios', usuarioRoutes);

db.getConnection()
    .then(() => console.log('Conectado a la base de datos'))
    .catch((err) => console.error('Error de conexión a la base de datos:', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
