class Ticket {
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
