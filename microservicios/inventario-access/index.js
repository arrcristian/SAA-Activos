const express = require('express');
const cors = require('cors');
const app = express();
const inventarioRoutes = require('./routes/inventarioRoutes');

app.use(express.json());
app.use(cors());
app.use('/api/inventario', inventarioRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Microservicio de inventario corriendo en el puerto ${PORT}`);
});
