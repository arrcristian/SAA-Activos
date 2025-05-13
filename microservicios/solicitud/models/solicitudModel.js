/**
 * ===============================================================
 * Nombre del archivo : solicitudModel.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Contiene la clase de la cual se generan los objetos de tipo Solicitud.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

/**
 * Clase Solicitud que permite que se creen objetos de tipo Solicitud.
 */
class Solicitud {
    /**
     * Constructor que se encarga de inicializar los objetos de tipo Solicitud.
     * @param {string} tracking_id - Clave de rastreo de la solicitud.
     * @param {string} ticket_id - Id del ticket del cual se genero la solicitud.
     * @param {string} usuario - Usuario que solicito el activo.
     * @param {string} email - Email del empleado que solicito el activo.
     * @param {string} resolutor - Nombre del resolutor encargado de esta solicitud.
     * @param {string} topico - Topico de la solicitud.
     * @param {string} departamento - Departamento al que pertenece el empleado.
     * @param {int} equipo_id - Id del equipo.
     * @param {Date} fecha_creacion - Fecha de creación de la solicitud.
     * @param {string} estado - Estado en el que se encuentra la solicitud.
     */
    constructor(tracking_id, ticket_id, usuario, email, resolutor, topico, departamento, equipo_id, fecha_creacion, estado) {
        this.tracking_id = tracking_id;
        this.ticket_id = ticket_id;
        this.usuario = usuario;
        this.email = email;
        this.resolutor = resolutor;
        this.topico = topico;
        this.departamento = departamento;
        this.equipo_id = equipo_id;
        this.estado = estado || 'pendiente';
        this.fecha_creacion = fecha_creacion || new Date();
    }
}

module.exports = Solicitud;
