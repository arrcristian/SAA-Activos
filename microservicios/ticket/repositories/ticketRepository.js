const db = require('../config/db'); // Importa el módulo con pool
const { sendMessage } = require('../config/rabbitmq');

const obtenerEventosPendientes = async () => {
    console.log("🔍 Realizando consulta a la base de datos para buscar eventos pendientes...");
    const [rows] = await db.pool.query(`
        SELECT ticket_id, topic_id, user_id, user_email_id, staff_id, dept_id, numero_ticket, fecha_creacion
        FROM ticket_eventos
    `);

    return rows;
};


const marcarEventoComoProcesado = async (id) => {
    await db.pool.query("DELETE FROM ticket_eventos WHERE ticket_id = ?", [id]); // 🔴 Cambié db.query → db.pool.query
    console.log(`✅ Evento con ID ${id} atendido correctamente.`);
};

const obtenerTicketPorId = async (ticket_id) => {
    const [rows] = await db.pool.query(`
        SELECT 
            t.ticket_id,
            t.number AS numero_ticket,
            u.name AS usuario,
            ue.address AS email,
            s.username AS resolutor,
            tp.topic AS topico,
            d.name AS departamento,
            (
                SELECT v.value
                FROM ost_form_entry e
                JOIN ost_form_entry_values v ON e.id = v.entry_id
                WHERE e.object_type = 'T'
                  AND e.object_id = t.ticket_id
                  AND v.field_id = 20
                LIMIT 1
            ) AS equipo_solicitado
        FROM ost_ticket t
        JOIN ost_user u ON t.user_id = u.id
        JOIN ost_user_email ue ON u.default_email_id = ue.id
        LEFT JOIN ost_staff s ON t.staff_id = s.staff_id
        JOIN ost_help_topic tp ON t.topic_id = tp.topic_id
        JOIN ost_department d ON t.dept_id = d.id
        WHERE t.ticket_id = ?
    `, [ticket_id]);    

    console.log('Se pudo obtener el ticket');
    return rows.length > 0 ? rows[0] : null;
};

const procesarEventosPendientes = async () => {
    const eventos = await obtenerEventosPendientes();

    if (eventos.length === 0) {
        console.log("🟢 No hay eventos pendientes.");
        return;
    }

    for (const evento of eventos) {
        console.log(`📌 Procesando evento con ID ${evento.ticket_id}...`);
        const ticket = await obtenerTicketPorId(evento.ticket_id);
        console.log(ticket);

        if (ticket) {
            console.log(`📤 Enviando ticket ${ticket.ticket_id} a la cola de RabbitMQ.`);
            await sendMessage(ticket);
            await marcarEventoComoProcesado(evento.ticket_id);
        }else{
            console.log('no hubo ticket');
        }
    }
};

module.exports = { procesarEventosPendientes };
