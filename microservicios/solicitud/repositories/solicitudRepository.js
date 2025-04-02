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

<<<<<<< Updated upstream
=======
const obtenerTodasLasSolicitudes = async () => {
    try {
        const [rows] = await pool.query(
            "SELECT clave_rastreo, usuario, resolutor, estado FROM solicitudes WHERE estado IN ('Pendiente', 'En Proceso', 'Cancelado')"
        );
        return rows;
    } catch (error) {
        console.error("❌ Error al obtener todas las solicitudes:", error);
        throw error;
    }
};

>>>>>>> Stashed changes
const obtenerSolicitudPorClave = async (clave_rastreo) => {
    try {
        const [rows] = await pool.query("SELECT * FROM solicitudes WHERE clave_rastreo = ?", [clave_rastreo]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("❌ Error al obtener solicitud:", error);
        throw error;
    }
};

const actualizarEstadoEnBD = async (clave_rastreo, nuevoEstado) => {
    try {
        const [result] = await pool.query(`
            UPDATE solicitudes 
            SET estado = ?, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE clave_rastreo = ?
        `, [nuevoEstado, clave_rastreo]);

        return result.affectedRows > 0;
    } catch (error) {
        console.error("❌ Error al actualizar estado:", error);
        throw error;
    }
};

const cancelarSolicitudEnBD = async (clave_rastreo) => {
    try {
        const [result] = await pool.query(`
            UPDATE solicitudes 
            SET estado = 'cancelado', fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE clave_rastreo = ?
        `, [clave_rastreo]);

        return result.affectedRows > 0;
    } catch (error) {
        console.error("❌ Error al cancelar solicitud:", error);
        throw error;
    }
};

<<<<<<< Updated upstream
module.exports = { crearSolicitud, obtenerSolicitudPorClave, actualizarEstadoEnBD, cancelarSolicitudEnBD };
=======

module.exports = { crearSolicitud, obtenerSolicitudPorClave, obtenerTodasLasSolicitudes, actualizarEstadoEnBD, cancelarSolicitudEnBD, obtenerHistorialDeSolicitud };

>>>>>>> Stashed changes
