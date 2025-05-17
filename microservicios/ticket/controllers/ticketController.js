/**
 * ===============================================================
 * Nombre del archivo : ticketController.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Se encarga de atender las peticiones relacionadas con los tickets.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const { procesarTickets } = require('../services/ticketService');
const ticketService = require('../services/ticketService');

/**
 * Método que se encarga de revisar cada cierto tiempo si hay algun nuevo ticket que tiene que ver con seguimiento de activos.
 * @param {import('express').Request} req - Objeto de solicitud HTTP.
 * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa el resultado obtenido en formato JSON.
 */
const checkEventos = async (req, res) => {
    try {
        await procesarTickets();
        res.status(200).json({ mensaje: "Eventos procesados correctamente" });
    } catch (error) {
        console.error("Error procesando eventos:", error);
        res.status(500).json({ error: "Error procesando eventos" });
    }
};

const responderTicket = async (req, res) => {
    const { ticket_id, clave_rastreo } = req.body;

    if (!ticket_id || !clave_rastreo) {
        return res.status(400).json({ error: 'ticket_id y clave_rastreo son requeridos.' });
    }

    try {
        await ticketService.insertarRespuestaAutomatica(ticket_id, clave_rastreo);
        res.status(200).json({ message: 'Respuesta agregada al ticket exitosamente.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al insertar respuesta en el ticket.' });
    }
};

module.exports = { checkEventos, responderTicket };
