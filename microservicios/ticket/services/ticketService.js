const ticketRepository = require('../repositories/ticketRepository');

const checkForTicketEvents = async () => {
    try {
        const events = await ticketRepository.getPendingEvents();

        if (events.length > 0) {
            events.forEach(async (event) => {
                console.log(`🔔 Evento detectado: Ticket ID ${event.ticket_id} con topic ${event.topic_id}`);

                // Marcar el evento como procesado
                await ticketRepository.markEventAsProcessed(event.id);
            });
        }
    } catch (error) {
        console.error("❌ Error al verificar eventos:", error);
    }
};

module.exports = {
    checkForTicketEvents
};
