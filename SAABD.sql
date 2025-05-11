DROP DATABASE solicitudes_db;

CREATE DATABASE IF NOT EXISTS solicitudes_db;
USE solicitudes_db;

CREATE TABLE contactos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    puesto VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    departamento VARCHAR(100) NOT NULL
);

INSERT INTO contactos (nombre, puesto, email, departamento) 
VALUES ('Kingue Quintana', 'Supervisor', 'kingue2003@gmail.com', 'Sales');

CREATE TABLE procesos (
    id_proceso INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO procesos (nombre) VALUES
('Proceso 1'),
('Proceso 2'),
('Proceso 3');

CREATE TABLE equipos (
    id_equipo INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    id_proceso INT NOT NULL,
    FOREIGN KEY (id_proceso) REFERENCES procesos(id_proceso)
);

INSERT INTO equipos (nombre, id_proceso) VALUES
('Desktop', 1),
('Laptop', 2),
('Impresora Multifuncional', 3),
('Impresora Laser', 3),
('Impresora de Matriz', 3),
('Impresora de Inyección', 3),
('Impresora a Color', 3),
('Router', 3),
('Switch de Red', 3),
('No Break', 3),
('Regulador', 3),
('CCTV', 3),
('Teléfono', 3),
('Teléfono Inalámbrico', 3),
('Scanner', 3),
('Conmutador', 3),
('Teclado', 3),
('Mouse', 3),
('Monitor', 3),
('Proyector', 3),
('Access Point', 3),
('Banda Ancha', 3),
('Internet Starlink', 3),
('Otros', 3);

CREATE TABLE etapas (
    id_etapa INT PRIMARY KEY AUTO_INCREMENT,
    id_proceso INT NOT NULL,
    nombre_etapa VARCHAR(100) NOT NULL,
    orden INT NOT NULL,
    FOREIGN KEY (id_proceso) REFERENCES procesos(id_proceso)
);

INSERT INTO etapas (id_proceso, nombre_etapa, orden) VALUES
(1, 'Solicitud Recibida', 1),
(1, 'Autorización Sistemas', 2),
(1, 'Autorización Dirección', 3),
(1, 'Preparación de Equipo', 4),
(1, 'Etapa de entrega', 5),
(1, 'Documentación Final', 6),
(1, 'Solicitud Finalizada', 7),
(1, 'Solicitud Cancelada', 8),
(2, 'Solicitud Recibida', 1),
(2, 'Autorización RH', 2),
(2, 'Autorización Sistemas', 3),
(2, 'Autorización Dirección', 4),
(2, 'Proceso de compra', 5),
(2, 'Preparación de Equipo', 6),
(2, 'Etapa de entrega', 7),
(2, 'Documentación Final', 8),
(2, 'Solicitud Finalizada', 9),
(2, 'Solicitud Cancelada', 10),
(3, 'Solicitud Recibida', 1),
(3, 'Autorización Sistemas', 2),
(3, 'Etapa de entrega', 3),
(3, 'Documentación Final', 4),
(3, 'Solicitud Finalizada', 5),
(3, 'Solicitud Cancelada', 6);

CREATE TABLE solicitudes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clave_rastreo VARCHAR(50) UNIQUE NOT NULL,
    ticket_id INT NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    resolutor VARCHAR(100),
    topico VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    id_equipo INT NOT NULL,
    id_etapa INT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo) ON DELETE CASCADE,
    FOREIGN KEY (id_etapa) REFERENCES etapas(id_etapa) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS historial_estados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave_rastreo VARCHAR(50) NOT NULL,
    id_etapa INT NOT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clave_rastreo) REFERENCES solicitudes(clave_rastreo) ON DELETE CASCADE,
    FOREIGN KEY (id_etapa) REFERENCES etapas(id_etapa) ON DELETE CASCADE
);

select * from equipos;

ALTER TABLE etapas
ADD COLUMN nombre_encargado VARCHAR(100) DEFAULT NULL,
ADD COLUMN correo_encargado VARCHAR(100) DEFAULT NULL;

-- Proceso 1
UPDATE etapas SET nombre_encargado = 'Encargado Sistemas', correo_encargado = 'ebasulto@gtepeyac.com'
WHERE nombre_etapa = 'Autorización Sistemas' AND id_proceso = 1;

UPDATE etapas SET nombre_encargado = 'Director General', correo_encargado = 'ebasulto@gtepeyac.com'
WHERE nombre_etapa = 'Autorización Dirección' AND id_proceso = 1;

-- Proceso 2
UPDATE etapas SET nombre_encargado = 'RRHH', correo_encargado = 'jvalenzuela@gtepeyac.com'
WHERE nombre_etapa = 'Autorización RH' AND id_proceso = 2;

UPDATE etapas SET nombre_encargado = 'Encargado Sistemas', correo_encargado = 'ebasulto@gtepeyac.com'
WHERE nombre_etapa = 'Autorización Sistemas' AND id_proceso = 2;

UPDATE etapas SET nombre_encargado = 'Director General', correo_encargado = 'ebasulto@gtepeyac.com'
WHERE nombre_etapa = 'Autorización Dirección' AND id_proceso = 2;

-- Proceso 3
UPDATE etapas SET nombre_encargado = 'Encargado Sistemas', correo_encargado = 'ebasulto@gtepeyac.com'
WHERE nombre_etapa = 'Autorización Sistemas' AND id_proceso = 3;

ALTER TABLE solicitudes ADD COLUMN service_tag VARCHAR(100) DEFAULT NULL;

