/**
 * ===============================================================
 * Nombre del archivo : ticketService.js
 * Autores              : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Se encarga de manejar la lógica necesaria para procesar los eventos y la cola de mensajes.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const { procesarEventosPendientes } = require('../repositories/ticketRepository');

/**
 * Método que se encarga de llamar al método necesario para procesar los eventos.
 */
const procesarTickets = async () => {
    await procesarEventosPendientes();
};

module.exports = { procesarTickets };
