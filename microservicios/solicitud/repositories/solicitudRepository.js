const pool = require('../config/db');

const crearSolicitud = async ({ tracking_id, ticket_id, usuario, email, resolutor, topico, departamento }) => {
    try {
        const [result] = await pool.query(`
            INSERT INTO solicitudes 
                (clave_rastreo, ticket_id, usuario, email, resolutor, topico, departamento)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            tracking_id,
            ticket_id,
            usuario,
            email,
            resolutor || null,
            topico,
            departamento
        ]);

        return result.affectedRows > 0;
    } catch (error) {
        console.error("❌ Error al crear solicitud:", error);
        throw error;
    }
};

module.exports = { crearSolicitud };
