const pool = require('../config/db');

const crearSolicitud = async ({ tracking_id, ticket_id, usuario, email, resolutor, topico, departamento }) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Estado inicial
        const estadoInicial = "pendiente";

        // Insertar en la tabla de solicitudes
        const [result] = await connection.query(`
            INSERT INTO solicitudes 
                (clave_rastreo, ticket_id, usuario, email, resolutor, topico, departamento, estado, fecha_creacion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [
            tracking_id,
            ticket_id,
            usuario,
            email,
            resolutor || null,
            topico,
            departamento,
            estadoInicial
        ]);

        if (result.affectedRows > 0) {
            // Insertar estado inicial en historial_estados
            await connection.query(`
                INSERT INTO historial_estados (clave_rastreo, estado) 
                VALUES (?, ?)
            `, [tracking_id, estadoInicial]);
        }

        await connection.commit();
        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        console.error("❌ Error al crear solicitud:", error);
        throw error;
    } finally {
        connection.release();
    }
};


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
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Actualiza el estado en la tabla principal
        const [updateResult] = await connection.query(`
            UPDATE solicitudes 
            SET estado = ?, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE clave_rastreo = ?
        `, [nuevoEstado, clave_rastreo]);

        // Inserta en la tabla de historial
        await connection.query(`
            INSERT INTO historial_estados (clave_rastreo, estado) 
            VALUES (?, ?)
        `, [clave_rastreo, nuevoEstado]);

        await connection.commit();
        return updateResult.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        console.error("❌ Error al actualizar estado y registrar historial:", error);
        throw error;
    } finally {
        connection.release();
    }
};

const obtenerHistorialDeSolicitud = async (clave_rastreo) => {
    try {
        const [rows] = await pool.query(`
            SELECT estado, fecha_cambio
            FROM historial_estados
            WHERE clave_rastreo = ? 
            ORDER BY fecha_cambio ASC
        `, [clave_rastreo]);
        
        return rows;
    } catch (error) {
        console.error("❌ Error al obtener historial de solicitud:", error);
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

module.exports = { crearSolicitud, obtenerSolicitudPorClave, actualizarEstadoEnBD, cancelarSolicitudEnBD, obtenerHistorialDeSolicitud };
