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
<<<<<<< Updated upstream
=======

CREATE TABLE IF NOT EXISTS historial_estados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave_rastreo VARCHAR(50) NOT NULL,
    estado ENUM('pendiente', 'en proceso', 'finalizado') NOT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clave_rastreo) REFERENCES solicitudes(clave_rastreo) ON DELETE CASCADE
);


CREATE TABLE contactos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    puesto VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    departamento VARCHAR(100) NOT NULL
);
>>>>>>> Stashed changes
