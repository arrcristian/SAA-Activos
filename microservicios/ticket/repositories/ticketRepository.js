const db = require('../config/db'); // Importa el módulo con pool
const { sendMessage } = require('../config/rabbitmq');

const obtenerEventosPendientes = async () => {
    console.log("🔍 Realizando consulta a la base de datos para buscar eventos pendientes...");
    const [rows] = await db.pool.query("SELECT * FROM ticket_eventos WHERE procesado = 0"); // 🔴 Cambié db.query → db.pool.query
    return rows;
};

const marcarEventoComoProcesado = async (id) => {
    await db.pool.query("UPDATE ticket_eventos SET procesado = 1 WHERE id = ?", [id]); // 🔴 Cambié db.query → db.pool.query
    console.log(`✅ Evento con ID ${id} marcado como procesado.`);
};

const obtenerTicketPorId = async (ticket_id) => {
    const [rows] = await db.pool.query(`
        SELECT t.id AS ticket_id, u.nombre AS usuario, u.email, r.nombre AS resolutor, tp.nombre AS tema
        FROM tickets t
        JOIN topics tp ON t.topic_id = tp.id
        JOIN users u ON t.user_id = u.id
        LEFT JOIN users r ON t.resolutor_id = r.id
        WHERE t.id = ?`, [ticket_id]);

    return rows.length > 0 ? rows[0] : null;
};


const procesarEventosPendientes = async () => {
    const eventos = await obtenerEventosPendientes();

    if (eventos.length === 0) {
        console.log("🟢 No hay eventos pendientes.");
        return;
    }

    for (const evento of eventos) {
        console.log(`📌 Procesando evento con ID ${evento.id} del ticket ${evento.ticket_id}...`);
        const ticket = await obtenerTicketPorId(evento.ticket_id);
        if (ticket) {
            console.log(`📤 Enviando ticket ${ticket.ticket_id} a la cola de RabbitMQ.`);
            await sendMessage(ticket);
            await marcarEventoComoProcesado(evento.id);
        }
    }
};

module.exports = { procesarEventosPendientes };
