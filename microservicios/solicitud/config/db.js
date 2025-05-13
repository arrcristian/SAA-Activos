/**
 * ===============================================================
 * Nombre del archivo : db.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Inicia la conexion con la base de datos de solicitudes.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Función que realiza la conexión con la base de datos mysql de solicitudes.
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
