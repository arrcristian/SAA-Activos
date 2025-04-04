class Solicitud {
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
