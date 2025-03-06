const Solicitud = require('../models/solicitudModel');
const { crearSolicitud } = require('../repositories/solicitudRepository');
const sendEmail = require('../services/emailService'); // Importación corregida
const crypto = require('crypto');

// Función para generar un Tracking ID único
const generarTrackingId = () => crypto.randomBytes(6).toString('hex').toUpperCase();

const crearNuevaSolicitud = async (req, res) => {
    try {
        const { ticket_id, usuario, email, resolutor } = req.body;

        if (!ticket_id || !usuario || !email || !resolutor) {
            return res.status(400).json({ error: "Faltan datos requeridos." });
        }

        // Generar tracking ID
        const tracking_id = generarTrackingId();
        const nuevaSolicitud = new Solicitud(tracking_id, ticket_id, usuario, email, resolutor);

        // Guardar en la base de datos
        const guardado = await crearSolicitud(nuevaSolicitud);

        if (guardado) {
            // Enviar correo con la clave de rastreo
            const asunto = "Confirmación de solicitud";
            const mensaje = `Hola ${usuario},\n\nTu solicitud ha sido registrada exitosamente.\n\nClave de rastreo: ${tracking_id}\n\nGracias por usar nuestro servicio.`;
            
            await sendEmail(email, asunto, mensaje);

            return res.status(201).json({ mensaje: "Solicitud creada con éxito", tracking_id });
        } else {
            return res.status(500).json({ error: "No se pudo crear la solicitud." });
        }
    } catch (error) {
        console.error("Error en el controlador al crear la solicitud:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
};

module.exports = { crearNuevaSolicitud };
