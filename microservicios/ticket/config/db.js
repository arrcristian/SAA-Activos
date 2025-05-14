/**
 * ===============================================================
 * Nombre del archivo : db.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Clase que contiene la lógica necesaria para conectarse a la base de datos de osticket.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Método que permite establecer una conexion con la base de datos de osticket.
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

/**
 * Función que permite probar la conexion con la base de datos.
 */
const connectDatabase = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Conectado a la base de datos");
        connection.release();
    } catch (error) {
        console.error("❌ Error conectando a la base de datos:", error);
        process.exit(1);
    }
};

module.exports = { pool, connectDatabase };