
CREATE TABLE ticket_eventos (
  id int(11) NOT NULL,
  ticket_id int(11) NOT NULL,
  topic_id int(11) NOT NULL,
  user_id int(11) NOT NULL,
  user_email_id int(11) NOT NULL,
  staff_id int(11) DEFAULT NULL,
  dept_id int(11) DEFAULT NULL,
  numero_ticket varchar(50) DEFAULT NULL,
  fecha_creacion timestamp NOT NULL DEFAULT current_timestamp()
)

DELIMITER $$

CREATE TRIGGER after_ticket_update 
AFTER UPDATE ON ost_ticket
FOR EACH ROW 
BEGIN
    -- Solo registrar si el topic_id cambió y el nuevo valor es 12
    IF OLD.topic_id <> NEW.topic_id AND NEW.topic_id = 12 THEN
        INSERT INTO ticket_eventos (
            ticket_id,
            topic_id,
            user_id,
            user_email_id,
            staff_id,
            dept_id,
            numero_ticket,
            fecha_creacion
        ) VALUES (
            NEW.ticket_id,
            NEW.topic_id,
            NEW.user_id,
            NEW.user_email_id,
            NEW.staff_id,
            NEW.dept_id,
            NEW.number,
            NOW()
        );
    END IF;
END$$

DELIMITER ;