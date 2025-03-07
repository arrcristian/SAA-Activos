const pool = require('../config/db');

const crearSolicitud = async ({ tracking_id, ticket_id, usuario, email, resolutor, estado }) => {
    try {
        const [result] = await pool.query(
            `INSERT INTO solicitudes (tracking_id, ticket_id, usuario, email, resolutor, estado) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [tracking_id, ticket_id, usuario, email, resolutor, estado]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error("❌ Error al crear solicitud:", error);
        throw error;
    }
};

module.exports = { crearSolicitud };
