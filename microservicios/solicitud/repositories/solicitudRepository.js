const pool = require('../config/db');

const crearSolicitud = async ({ tracking_id, ticket_id, usuario, email, resolutor, topico, departamento, equipo_id }) => {
 
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Obtener la primera etapa del proceso correspondiente al equipo
        const [etapaInicial] = await connection.query(`
            SELECT e.id_etapa 
            FROM etapas e
            JOIN equipos eq ON e.id_proceso = eq.id_proceso
            WHERE eq.id_equipo = ?
            ORDER BY e.orden ASC
            LIMIT 1
        `, [equipo_id]);

        if (etapaInicial.length === 0) {
            throw new Error("No se encontró una etapa inicial para este equipo.");
        }

        const id_etapa = etapaInicial[0].id_etapa;

        // Insertar en la tabla de solicitudes
        const [result] = await connection.query(`
            INSERT INTO solicitudes 
                (clave_rastreo, ticket_id, usuario, email, resolutor, topico, departamento, id_equipo, id_etapa, fecha_creacion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [
            tracking_id,
            ticket_id,
            usuario,
            email,
            resolutor || null,
            topico,
            departamento,
            equipo_id,
            id_etapa
        ]);

        if (result.affectedRows > 0) {
            // Insertar estado inicial en historial_estados
            await connection.query(`
                INSERT INTO historial_estados (clave_rastreo, id_etapa) 
                VALUES (?, ?)
            `, [tracking_id, id_etapa]);
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


const obtenerTodasLasSolicitudes = async () => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.clave_rastreo,
                s.usuario,
                s.resolutor,
                et.nombre_etapa AS estado,
                eq.nombre AS tipo_equipo
            FROM solicitudes s
            JOIN etapas et ON s.id_etapa = et.id_etapa
            JOIN equipos eq ON s.id_equipo = eq.id_equipo
        `);
        return rows;
    } catch (error) {
        console.error("❌ Error al obtener todas las solicitudes:", error);
        throw error;
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

const actualizarEstadoEnBD = async (clave_rastreo, id_etapa) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Actualiza la etapa en la tabla principal
        const [updateResult] = await connection.query(`
            UPDATE solicitudes 
            SET id_etapa = ?, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE clave_rastreo = ?
        `, [id_etapa, clave_rastreo]);

        // Inserta en la tabla de historial
        await connection.query(`
            INSERT INTO historial_estados (clave_rastreo, id_etapa) 
            VALUES (?, ?)
        `, [clave_rastreo, id_etapa]);

        await connection.commit();
        return updateResult.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        console.error("❌ Error al actualizar etapa y registrar historial:", error);
        throw error;
    } finally {
        connection.release();
    }
};

const obtenerEtapasPorEquipo = async (id_equipo) => {
    try {
        const query = `
            SELECT e.id_etapa, e.nombre_etapa
            FROM etapas e
            JOIN procesos p ON e.id_proceso = p.id_proceso
            JOIN equipos eq ON eq.id_proceso = p.id_proceso
            WHERE eq.id_equipo = ?
            ORDER BY e.orden ASC
        `;

        const [rows] = await pool.query(query, [id_equipo]);
        return rows; // [{ id_etapa, nombre_etapa }, ...]
    } catch (error) {
        console.error("❌ Error al obtener etapas por equipo:", error);
        throw error;
    }
};

const obtenerHistorialDeSolicitud = async (clave_rastreo) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(`
            SELECT e.nombre_etapa, h.fecha_cambio
            FROM historial_estados h
            JOIN etapas e ON h.id_etapa = e.id_etapa
            WHERE h.clave_rastreo = ? 
            ORDER BY h.fecha_cambio ASC
        `, [clave_rastreo]);
        
        return rows;
    } catch (error) {
        console.error("❌ Error al obtener historial de solicitud:", error);
        throw error;
    } finally {
        connection.release();
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

const obtenerEquipos = async (nombre_equipo) => {
    try {
        const query = `
            SELECT e.id_equipo
            FROM equipos e
            WHERE e.nombre = ?
        `;

        const [rows] = await pool.query(query, [nombre_equipo]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("❌ Error al obtener el equipo:", error);
        throw error;
    }
};

const obtenerTiposEquipo = async () => {
    try {
        const query = `
            SELECT DISTINCT nombre
            FROM equipos
        `;
        const [rows] = await pool.query(query);
        return rows.map(row => row.nombre);
    } catch (error) {
        console.error("❌ Error al obtener tipos de equipo:", error);
        throw error;
    }
};

module.exports = { crearSolicitud, obtenerEquipos, obtenerTiposEquipo, obtenerSolicitudPorClave, obtenerTodasLasSolicitudes, actualizarEstadoEnBD, cancelarSolicitudEnBD, obtenerHistorialDeSolicitud, obtenerEtapasPorEquipo };


