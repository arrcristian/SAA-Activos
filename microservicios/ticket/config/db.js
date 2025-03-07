const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para probar la conexión
const connectDatabase = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Conectado a la base de datos");
        connection.release(); // Liberar conexión
    } catch (error) {
        console.error("❌ Error conectando a la base de datos:", error);
        process.exit(1); // Detener el proceso si hay error
    }
};

module.exports = { pool, connectDatabase };
