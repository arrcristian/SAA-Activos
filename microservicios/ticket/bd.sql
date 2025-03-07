-- 1️⃣ Crear la base de datos
CREATE DATABASE IF NOT EXISTS ticket_system;
USE ticket_system;

-- 2️⃣ Crear la tabla de temas de ayuda
CREATE TABLE topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- 3️⃣ Crear la tabla de usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

-- 4️⃣ Crear la tabla de tickets
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic_id INT NOT NULL,
    user_id INT NOT NULL,
    resolutor_id INT DEFAULT NULL,  -- Persona encargada de resolver el ticket
    estado ENUM('Abierto', 'En Progreso', 'Resuelto', 'Cerrado') DEFAULT 'Abierto',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (resolutor_id) REFERENCES users(id)
);

-- 5️⃣ Crear la tabla de eventos
CREATE TABLE ticket_eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    topic_id INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    procesado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

DELIMITER $$

CREATE TRIGGER trigger_ticket_update
AFTER UPDATE ON tickets
FOR EACH ROW
BEGIN
    -- Verifica si el topic_id cambió y si el nuevo tema de ayuda es "3"
    IF OLD.topic_id <> NEW.topic_id AND NEW.topic_id = 3 THEN
        INSERT INTO ticket_eventos (ticket_id, topic_id)
        VALUES (NEW.id, NEW.topic_id);
    END IF;
END $$

DELIMITER ;
