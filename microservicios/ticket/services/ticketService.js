/**
 * ===============================================================
 * Nombre del archivo : ticketService.js
 * Autores              : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Se encarga de manejar la lógica necesaria para procesar los eventos y la cola de mensajes.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const ticketRepository = require('../repositories/ticketRepository');

/**
 * Método que se encarga de llamar al método necesario para procesar los eventos.
 */
const procesarTickets = async () => {
    await ticketRepository.procesarEventosPendientes();
};

const insertarRespuestaAutomatica = async (ticket_id, clave_rastreo) => {
    const thread_id = await ticketRepository.obtenerThreadId(ticket_id);

    if (!thread_id) {
        throw new Error('Ticket no encontrado.');
    }

    const mensaje = `
<p><strong>Respuesta automática:</strong></p>

<p>Se ha generado una nueva solicitud asociada a este ticket y ha sido registrada exitosamente en el Sistema de Administración de Activos.</p>

<p>Puedes revisarla en el siguiente enlace:<br>
<a href="http://localhost:4005/seguimiento_detalles.html?clave=${clave_rastreo}" target="_blank">
http://localhost:4005/seguimiento_detalles.html?clave=${clave_rastreo}
</p>

<p>Por favor, guarda esta clave para futuras referencias.</p>

<p>Gracias.</p>
`;

    await ticketRepository.insertarRespuestaEnHilo(thread_id, mensaje);
};

module.exports = { procesarTickets, insertarRespuestaAutomatica };
