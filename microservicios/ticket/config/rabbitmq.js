/**
 * ===============================================================
 * Nombre del archivo : rabbitmq.js
 * Autores              : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Establece la lógica necesaria para realizar una conexion con la cola de mensajes de rabbitmq.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://localhost'; 
const QUEUE_NAME = 'ticket_queue';

let channel;

/**
 * Método para establecer conexion con rabbitmq.
 */
const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log("✅ Conectado a RabbitMQ y cola creada");
    } catch (error) {
        console.error("❌ Error conectando a RabbitMQ:", error);
    }
};

/**
 * Método para enviar un mensaje a la cola de mensajes de rabbitmq.
 * @param {string} message - Mensaje que se agregara a la cola de mensajes.
 * @returns {Promise<Void>}
 */
const sendMessage = async (message) => {
    if (!channel) {
        console.error("❌ Canal de RabbitMQ no disponible");
        return;
    }
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log(`📤 Mensaje enviado a RabbitMQ:`, message);
};

module.exports = { connectRabbitMQ, sendMessage };
