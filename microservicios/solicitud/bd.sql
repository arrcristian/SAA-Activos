CREATE DATABASE IF NOT EXISTS solicitudes_db;
USE solicitudes_db;

CREATE TABLE solicitudes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clave_rastreo VARCHAR(50) UNIQUE NOT NULL,
    ticket_id INT NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    resolutor VARCHAR(100),
    topico VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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

DELIMITER //
CREATE TRIGGER before_update_estado
BEFORE UPDATE ON solicitudes
FOR EACH ROW
BEGIN
    IF OLD.estado <> NEW.estado THEN
        INSERT INTO historial_estados (tracking_id, estado, fecha_cambio)
        VALUES (OLD.tracking_id, NEW.estado, NOW());
    END IF;
END;
//
DELIMITER ;
