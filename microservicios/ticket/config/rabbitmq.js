const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://localhost'; // O la URL si es en otro servidor
const QUEUE_NAME = 'ticket_queue';

let channel;

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

const sendMessage = async (message) => {
    if (!channel) {
        console.error("❌ Canal de RabbitMQ no disponible");
        return;
    }
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log(`📤 Mensaje enviado a RabbitMQ:`, message);
};

module.exports = { connectRabbitMQ, sendMessage };
