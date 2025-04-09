const amqp = require('amqplib');
const Solicitud = require('../models/solicitudModel');
const { crearSolicitud, obtenerEquipos } = require('../repositories/solicitudRepository');
const { obtenerCorreoSupervisor } = require('../repositories/contactoRepository');
const sendEmail = require('./emailService');
const crypto = require('crypto');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'ticket_queue';

// Función para generar un Tracking ID único
const generarTrackingId = () => crypto.randomBytes(6).toString('hex').toUpperCase();

function extraerEquipoDesdeTexto(texto) {
    const match = texto.match(/#(\w+)/); // Busca algo como #Impresora
    return match ? match[1] : null; // Devuelve 'Impresora' si encontró algo
}

const iniciarConsumidor = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log(`📥 Esperando mensajes en la cola: ${QUEUE_NAME}...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                try {
                    const evento = JSON.parse(msg.content.toString());
                    console.log("✅ Mensaje recibido:", evento);

                    const { ticket_id, numero_ticket, usuario, email, resolutor, topico, departamento, equipo_solicitado } = evento;

                    if (!ticket_id || !numero_ticket || !usuario || !email || !resolutor || !topico || !departamento || !equipo_solicitado) {
                        console.error("❌ Evento inválido, faltan datos requeridos.");
                        channel.nack(msg, false, false); // Rechaza el mensaje sin reintentar
                        return;
                    }

                    // Generar tracking ID
                    const tracking_id = generarTrackingId();

                    const equipo = extraerEquipoDesdeTexto(equipo_solicitado);

                    const id = await obtenerEquipos(equipo);

                    if (id == null) {
                        console.error("❌ Evento inválido, no se identifa al equipo.");
                        channel.nack(msg, false, false); // Rechaza el mensaje sin reintentar
                        return;
                    }

                    const equipo_id = id.id_equipo;

                    console.log(equipo_id);

                    const nuevaSolicitud = new Solicitud(tracking_id, ticket_id, usuario, email, resolutor, topico, departamento, equipo_id);

                    const guardado = await crearSolicitud(nuevaSolicitud);

                    if (guardado) {
                        const asuntoUsuario = "Confirmación de solicitud";
                        const mensajeUsuario = `Hola ${usuario},\n\nTu solicitud ha sido registrada exitosamente.\n\nClave de rastreo: ${tracking_id}\n\nGracias por usar nuestro servicio.`;

                        await sendEmail(email, asuntoUsuario, mensajeUsuario, false);

                        console.log(`📩 Correo enviado a ${email} con tracking ID: ${tracking_id}`);

                        // Obtener correo del supervisor
                        const supervisor = await obtenerCorreoSupervisor(departamento);

                        console.log(supervisor);
                        if (supervisor) {
                            // Crear enlaces de aprobación y cancelación
                            const enlaceAprobar = `${process.env.APP_URL}/api/solicitudes/respuesta?clave_rastreo=${tracking_id}&respuesta=si`;
                            const enlaceRechazar = `${process.env.APP_URL}/api/solicitudes/respuesta?clave_rastreo=${tracking_id}&respuesta=no`;

                            const asuntoSupervisor = "Nueva Solicitud Pendiente";
                            const mensajeSupervisor = `
    <html>
    <body>
        <p>Hola ${supervisor.nombre},</p>
        <p>Se ha generado una nueva solicitud.</p>
        <p><strong>Clave de rastreo:</strong> ${tracking_id}</p>
        <p><strong>Usuario:</strong> ${usuario}</p>
        <p><strong>Departamento:</strong> ${departamento}</p>
        <p><strong>Equipo ID:</strong> ${equipo_id}</p>
        <p>¿Deseas aprobar o cancelar la solicitud?</p>
        <p>
            <a href="${enlaceAprobar}" style="display:inline-block;padding:10px;background-color:green;color:white;text-decoration:none;border-radius:5px;">
                ✅ Aprobar
            </a> 
            &nbsp;&nbsp;
            <a href="${enlaceRechazar}" style="display:inline-block;padding:10px;background-color:red;color:white;text-decoration:none;border-radius:5px;">
                ❌ Rechazar
            </a>
        </p>
    </body>
    </html>
`;
                            await sendEmail(supervisor.email, asuntoSupervisor, mensajeSupervisor, true);
                        }

                        console.log(`📩 Correo enviado a supervisor con correo ${supervisor.email} con tracking ID: ${tracking_id}`);
                        channel.ack(msg); // Confirma el mensaje
                    } else {
                        console.error("❌ No se pudo crear la solicitud.");
                        channel.nack(msg, false, true); // Reintenta el mensaje
                    }
                } catch (error) {
                    console.error("❌ Error procesando mensaje:", error);
                    channel.nack(msg, false, true); // Reintenta el mensaje
                }
            }
        });
    } catch (error) {
        console.error("❌ Error al conectar con RabbitMQ:", error);
        process.exit(1);
    }
};

module.exports = iniciarConsumidor;
