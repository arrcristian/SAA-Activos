/**
 * ===============================================================
 * Nombre del archivo : dbConfig.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Se encarga de establecer los metodos necesarios para conectarse con la base de datos de osticket.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Método que se encarga de establecer conexion con la base de datos de osticket.
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,  
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
