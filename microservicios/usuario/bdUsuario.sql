CREATE DATABASE IF NOT EXISTS usuarios_db;
USE usuarios_db;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) UNIQUE NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    nombre varchar(100) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    tipo ENUM('cliente', 'resolutor') NOT NULL
);