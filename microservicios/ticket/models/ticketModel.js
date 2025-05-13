/**
 * ===============================================================
 * Nombre del archivo : ticketModel.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Se encarga de establecer una clase para poder crear objetos de tipo Ticket.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

/**
 * Clase Ticket para poder generar objetos de tipo Ticket.
 */
class Ticket {
    /**
     * Constructor que se encarga de incializar los datos de un objeto de tipo Ticket.
     * @param {int} id - Id del ticket.
     * @param {int} topic_id - Id del topico del ticket.
     * @param {int} user_id - Id del empleado.
     * @param {int} resolutor_id - Id del resolutor.
     * @param {string} estado - Estado del ticket.
     * @param {Date} fecha_creacion - Fecha de creacion del ticket.
     */
    constructor(id, topic_id, user_id, resolutor_id, estado, fecha_creacion) {
        this.id = id;
        this.topic_id = topic_id;
        this.user_id = user_id;
        this.resolutor_id = resolutor_id;
        this.estado = estado;
        this.fecha_creacion = fecha_creacion;
    }
}

module.exports = Ticket;
