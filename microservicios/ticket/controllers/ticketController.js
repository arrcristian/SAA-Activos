const ticketService = require('../services/ticketService');

const checkEvents = async (req, res) => {
    await ticketService.checkForTicketEvents();
    res.json({ message: "Verificación completada" });
};

module.exports = { checkEvents };
