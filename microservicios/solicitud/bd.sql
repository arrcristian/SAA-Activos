CREATE DATABASE IF NOT EXISTS solicitudes_db;
USE solicitudes_db;

CREATE TABLE IF NOT EXISTS solicitudes (
    tracking_id VARCHAR(20) PRIMARY KEY,
    ticket_id INT NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    resolutor VARCHAR(100) NOT NULL,
    estado ENUM('pendiente', 'en proceso', 'completado') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
