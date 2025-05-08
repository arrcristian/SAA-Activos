const express = require('express');
const app = express();
const inventarioRoutes = require('./routes/inventarioRoutes');

app.use(express.json());
app.use('/api/inventario', inventarioRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Microservicio de inventario corriendo en el puerto ${PORT}`);
});
