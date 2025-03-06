const pool = require('../config/db');

const getPendingEvents = async () => {
    const [rows] = await pool.query("SELECT * FROM ticket_eventos WHERE procesado = FALSE");
    return rows;
};

const markEventAsProcessed = async (id) => {
    await pool.query("UPDATE ticket_eventos SET procesado = TRUE WHERE id = ?", [id]);
};

module.exports = {
    getPendingEvents,
    markEventAsProcessed
};
