/**
 * ===============================================================
 * Nombre del archivo : rabbitmqConsumer.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Establece los métodos necesarios para poder interactuar con rabbitmq y manejar las colas de mensajes.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const amqp = require('amqplib');
const Solicitud = require('../models/solicitudModel');
const { crearSolicitud, obtenerEquipos } = require('../repositories/solicitudRepository');
const { enviarCorreoEncargado, obtenerEtapasValidasPorEquipo } = require('../services/solicitudService');
const sendEmail = require('./emailService');
const crypto = require('crypto');
const axios = require('axios');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'ticket_queue';

/**
 * Método para generar una clave de rastreo única e irrepetible.
 * @returns {string} La clave de rastreo generada.
 */
const generarTrackingId = () => crypto.randomBytes(6).toString('hex').toUpperCase();

/**
 * Método que identifica de que equipo se trata a partir de un texto.
 * @param {string} texto - Texto que contiene el equipo entre llaves {}. 
 * @returns {string} El equipo extraido a partir del texto brindado.
 */
function extraerEquipoDesdeTexto(texto) {
    const match = texto.match(/\{([^}]+)\}/); // Busca texto entre llaves { ... }
    return match ? match[1].trim() : null; // Devuelve el contenido sin espacios extra si lo encontró
}

/**
 * Método que inicia el consumidor que se encarga de revisar constantemente la cola de mensajes de rabbitmq.
 */
const iniciarConsumidor = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // 🛡️ Manejamos errores de conexión y canal para evitar que explote el proceso
        connection.on('error', (err) => {
            console.error('❌ Error en la conexión a RabbitMQ:', err.message);
        });

        connection.on('close', () => {
            console.warn('⚠️ Conexión con RabbitMQ cerrada. Considera intentar reconectar...');
            // Aquí podrías volver a llamar a iniciarConsumidor() si quieres reconexión automática.
        });

        channel.on('error', (err) => {
            console.error('❌ Error en el canal de RabbitMQ:', err.message);
        });

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
                        channel.nack(msg, false, false);
                        return;
                    }

                    const tracking_id = generarTrackingId();
                    const equipo = extraerEquipoDesdeTexto(equipo_solicitado);
                    const id = await obtenerEquipos(equipo);

                    if (id == null) {
                        console.error("❌ Evento inválido, no se identifica al equipo.");
                        channel.nack(msg, false, false);
                        return;
                    }

                    const equipo_id = id.id_equipo;
                    const nuevaSolicitud = new Solicitud(tracking_id, ticket_id, usuario, email, resolutor, topico, departamento, equipo_id);

                    const guardado = await crearSolicitud(nuevaSolicitud);

                    if (guardado) {
                        const asuntoUsuario = "Confirmación de solicitud";
                        const enlace = `http://localhost:4005/seguimiento_detalles.html?clave=${tracking_id}`;
                        const mensajeUsuario = `
Hola ${usuario},

Tu solicitud ha sido registrada exitosamente.

Puedes consultar el estado de tu solicitud en el siguiente enlace:
${enlace}

Gracias por usar nuestro servicio.
`;

                        await sendEmail(email, asuntoUsuario, mensajeUsuario, false);
                        console.log(`📩 Correo enviado a ${email} con tracking ID: ${tracking_id}`);

                        const etapas = await obtenerEtapasValidasPorEquipo(equipo_id);
                        if (!etapas) console.error("No se encontraron las etapas para el equipo requerido.");
                        await enviarCorreoEncargado(etapas[1], tracking_id);

                        console.log(`📩 Correo enviado a supervisor con correo ${etapas[1].correo_encargado} con tracking ID: ${tracking_id}`);

                        try {
                            await axios.post('http://localhost:3000/api/tickets/responder-ticket', {
                                ticket_id: ticket_id,
                                clave_rastreo: tracking_id
                            });
                            console.log(`📝 Respuesta automática enviada al ticket ${ticket_id}`);
                        } catch (error) {
                            console.error(`❌ Error al responder al ticket automáticamente:`, error.message);
                        }
                        channel.ack(msg);
                    } else {
                        console.error("❌ No se pudo crear la solicitud.");
                        channel.nack(msg, false, true);
                    }
                } catch (error) {
                    console.error("❌ Error procesando mensaje:", error);
                    channel.nack(msg, false, true);
                }
            }
        });
    } catch (error) {
        console.error("❌ Error al conectar con RabbitMQ:", error.message);
        // En lugar de cerrar el proceso directamente, puedes esperar e intentar reconectar
        setTimeout(() => {
            console.log("🔁 Reintentando conexión con RabbitMQ...");
            iniciarConsumidor(); // reconexión básica
        }, 5000);
    }
};

module.exports = iniciarConsumidor;
