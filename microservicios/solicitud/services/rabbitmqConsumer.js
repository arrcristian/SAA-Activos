const amqp = require('amqplib');
const Solicitud = require('../models/solicitudModel');
const { crearSolicitud, obtenerEquipos } = require('../repositories/solicitudRepository');
const { enviarCorreoEncargado, obtenerEtapasValidasPorEquipo } = require('../services/solicitudService');
const sendEmail = require('./emailService');
const crypto = require('crypto');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'ticket_queue';

// Función para generar un Tracking ID único
const generarTrackingId = () => crypto.randomBytes(6).toString('hex').toUpperCase();

function extraerEquipoDesdeTexto(texto) {
    const match = texto.match(/\{([^}]+)\}/); // Busca texto entre llaves { ... }
    return match ? match[1].trim() : null; // Devuelve el contenido sin espacios extra si lo encontró
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
                        const etapas = await obtenerEtapasValidasPorEquipo(equipo_id);
                        if (!etapas) console.error("No se encontraron las etapas para el equipo requerido.");
                        await enviarCorreoEncargado(etapas[1], tracking_id);

                        console.log(`📩 Correo enviado a supervisor con correo ${etapas[1].correo_encargado} con tracking ID: ${tracking_id}`);
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
