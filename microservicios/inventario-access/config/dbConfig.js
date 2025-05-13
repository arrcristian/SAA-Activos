/**
 * ===============================================================
 * Nombre del archivo : dbConfig.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Establece la conexion con la base de datos en Access.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const odbc = require('odbc');
const path = require('path');

// Ruta absoluta al archivo de la base de datos
const dbPath = path.join(__dirname, '..', 'InventarioEquipos.accdb');
const connectionString = `Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq=${dbPath};`;

/**
 * Función que establece la conexión con la base de datos de Access.
 * @returns {Promise<odbc.Connection>} La conexión que se estableció con la base de datos.
 */
async function getConnection() {
  try {
    return await odbc.connect(connectionString);
  } catch (error) {
    console.error('Error al conectar a Access:', error);
    throw error;
  }
}

module.exports = getConnection;
