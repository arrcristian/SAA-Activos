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

// Función para inicializar la base de datos y la tabla
async function initializeDatabase() {
    let connection;
    try {
      connection = await pool.getConnection();
      
      // Crear la base de datos si no existe
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
      console.log(`Base de datos '${process.env.DB_NAME}' asegurada.`);
  
      // Usar la base de datos
      await connection.query(`USE \`${process.env.DB_NAME}\`;`);
  
      // Crear la tabla si no existe
      const tableQuery = `
        CREATE TABLE IF NOT EXISTS usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          correo VARCHAR(100) UNIQUE NOT NULL,
          contrasena VARCHAR(255) NOT NULL,
          tipo ENUM('cliente', 'organizador') NOT NULL,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await connection.query(tableQuery);
      console.log("Tabla 'usuarios' asegurada.");
    } catch (error) {
      console.error("Error al inicializar la base de datos:", error);
    } finally {
      if (connection) connection.release();
    }
  }
  
  module.exports = { pool, initializeDatabase };