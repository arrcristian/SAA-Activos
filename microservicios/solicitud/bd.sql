CREATE DATABASE IF NOT EXISTS solicitudes_db;
USE solicitudes_db;

CREATE TABLE procesos (
    id_proceso INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE
);


CREATE TABLE equipos (
    id_equipo INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    id_proceso INT NOT NULL,
    FOREIGN KEY (id_proceso) REFERENCES procesos(id_proceso)
);


CREATE TABLE etapas (
    id_etapa INT PRIMARY KEY AUTO_INCREMENT,
    id_proceso INT NOT NULL,
    nombre_etapa VARCHAR(100) NOT NULL,
    orden INT NOT NULL,
    nombre_encargado VARCHAR(100) DEFAULT NULL,
	correo_encargado VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (id_proceso) REFERENCES procesos(id_proceso)
);


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
    service_tag VARCHAR(100) DEFAULT NULL,
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
