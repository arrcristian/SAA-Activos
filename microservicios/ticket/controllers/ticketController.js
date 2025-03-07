const { procesarTickets } = require('../services/ticketService');

const checkEventos = async (req, res) => {
    try {
        await procesarTickets();
        res.status(200).json({ mensaje: "Eventos procesados correctamente" });
    } catch (error) {
        console.error("Error procesando eventos:", error);
        res.status(500).json({ error: "Error procesando eventos" });
    }
};

module.exports = { checkEventos };
