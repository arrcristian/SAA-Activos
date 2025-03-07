const amqp = require('amqplib');
const { crearSolicitud } = require('../repositories/solicitudRepository');
const sendEmail = require('./emailService');
const crypto = require('crypto');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'ticket_queue';

// Función para generar un Tracking ID único
const generarTrackingId = () => crypto.randomBytes(6).toString('hex').toUpperCase();

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

                    const { ticket_id, usuario, email, resolutor } = evento;

                    if (!ticket_id || !usuario || !email || !resolutor) {
                        console.error("❌ Evento inválido, faltan datos requeridos.");
                        channel.nack(msg, false, false); // Rechaza el mensaje sin reintentar
                        return;
                    }

                    // Generar tracking ID
                    const tracking_id = generarTrackingId();

                    // Guardar en la base de datos
                    const nuevaSolicitud = {
                        tracking_id,
                        ticket_id,
                        usuario,
                        email,
                        resolutor,
                        estado: 'Pendiente'
                    };

                    const guardado = await crearSolicitud(nuevaSolicitud);

                    if (guardado) {
                        // Enviar correo con la clave de rastreo
                        const asunto = "Confirmación de solicitud";
                        const mensaje = `Hola ${usuario},\n\nTu solicitud ha sido registrada exitosamente.\n\nClave de rastreo: ${tracking_id}\n\nGracias por usar nuestro servicio.`;
                        await sendEmail(email, asunto, mensaje);

                        console.log(`📩 Correo enviado a ${email} con tracking ID: ${tracking_id}`);
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
