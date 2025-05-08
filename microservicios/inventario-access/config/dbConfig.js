const odbc = require('odbc');
const path = require('path');

// Ruta absoluta al archivo .accdb
const dbPath = path.join(__dirname, '..', 'InventarioEquipos.accdb');
const connectionString = `Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq=${dbPath};`;

async function getConnection() {
  try {
    return await odbc.connect(connectionString);
  } catch (error) {
    console.error('Error al conectar a Access:', error);
    throw error;
  }
}

module.exports = getConnection;
