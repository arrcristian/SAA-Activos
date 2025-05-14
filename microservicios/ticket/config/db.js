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

let pool;

/**
 * Metodo que continuamente intenta conectar al microservicio con la base de datos de osticket.
 * @param {int} retryInterval - Intervalo de tiempo entre conexiones.
 */
const connectDatabase = async (retryInterval = 5000) => {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: 3307,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const connection = await pool.getConnection();
        console.log("✅ Conectado a la base de datos");
        connection.release();

    } catch (error) {
        console.error("❌ Falló la conexión a la base de datos:", error.message);
        setTimeout(() => connectDatabase(retryInterval), retryInterval);
    }
};

/**
 * Metodo que regresa el pool de conexiones.
 * @returns {Object} El objeto de conexiones creado.
 */
function getPool() {
    if (!pool) throw new Error("⚠️ Base de datos no conectada aún.");
    return pool;
}

module.exports = { getPool, connectDatabase };