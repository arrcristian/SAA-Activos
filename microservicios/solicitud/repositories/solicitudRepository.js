const pool = require('../config/db');
const Solicitud = require('../models/solicitudModel');

const crearSolicitud = async (solicitud) => {
    const { tracking_id, ticket_id, usuario, email, resolutor, estado } = solicitud;

    try {
        const [result] = await pool.query(
            `INSERT INTO solicitudes (tracking_id, ticket_id, usuario, email, resolutor, estado) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [tracking_id, ticket_id, usuario, email, resolutor, estado]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error en el repositorio al crear solicitud:", error);
        throw error;
    }
};

module.exports = { crearSolicitud };
