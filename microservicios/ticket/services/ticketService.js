const { procesarEventosPendientes } = require('../repositories/ticketRepository');

const procesarTickets = async () => {
    await procesarEventosPendientes();
};

module.exports = { procesarTickets };
