/**
 * ===============================================================
 * Nombre del archivo : solicitudRepository.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Contiene los metodos necesarios para interactuar con la base de datos de solicitudes.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const pool = require('../config/db');

/**
 * Método que se encarga de guardar una nueva solicitud en la base de datos.
 * @param {Object} param0 - Objeto de tipo Solicitud que contiene toda la información necesaria para un nuevo registro en la base de datos.
 * @returns {boolean} True si se creo una nueva solicitud, False en caso contrario.
 */
const crearSolicitud = async ({ tracking_id, ticket_id, usuario, email, resolutor, topico, departamento, equipo_id }) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

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

/**
 * Método que se encarga de obtener todas las solicitudes activas de la base de datos.
 * @returns {Array<<Object>>} Un arreglo de objetos con la informacion de cada solicitud.
 */
const obtenerTodasLasSolicitudes = async () => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.clave_rastreo,
                s.usuario,
                s.resolutor,
                s.fecha_creacion,
                s.fecha_actualizacion,
                et.nombre_etapa AS estado,
                eq.nombre AS tipo_equipo
            FROM solicitudes s
            JOIN etapas et ON s.id_etapa = et.id_etapa
            JOIN equipos eq ON s.id_equipo = eq.id_equipo
            WHERE et.nombre_etapa NOT IN ('Solicitud Cancelada', 'Solicitud Finalizada')
        `);
        return rows;
    } catch (error) {
        console.error("❌ Error al obtener todas las solicitudes:", error);
        throw error;
    }
};

/**
 * Método que se encarga de obtener una solicitud con una clave de rastreo especifica.
 * @param {string} clave_rastreo - Clave de rastreo de la solicitud que se busca obtener.
 * @returns {Object} Objeto que contiene la información de la solicitud con la clave de rastreo especificada.
 */
const obtenerSolicitudPorClave = async (clave_rastreo) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.clave_rastreo,
                s.usuario,
                s.resolutor,
                s.fecha_creacion,
                s.fecha_actualizacion,
                s.id_etapa,
                s.id_equipo,
                et.nombre_etapa AS estado,
                eq.nombre AS tipo_equipo
            FROM solicitudes s
            JOIN etapas et ON s.id_etapa = et.id_etapa
            JOIN equipos eq ON s.id_equipo = eq.id_equipo
            WHERE s.clave_rastreo = ?`, [clave_rastreo]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("❌ Error al obtener solicitud:", error);
        throw error;
    }
};

/**
 * Método que se encarga de actualizar el estado de una solicitud en la base de datos.
 * @param {string} clave_rastreo - Clave de rastreo de la solicitud que se desea actualizar.
 * @param {int} id_etapa - Id de la etapa siguiente a la que hay que actualizar.
 * @returns {boolean} True si la actualización se realizó con éxito, False en caso contrario.
 */
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

/**
 * Método que se encarga de obtener las etapas del proceso que pertenecen a un equipo en especifico.
 * @param {int} id_equipo - Id del equipo sobre el cual se quiere averiguar que etapas son por las que pasa.
 * @returns {Array<<Object>>} Arreglo que incluye las etapas que conciernen al equipo especificado.
 */
const obtenerEtapasPorEquipo = async (id_equipo) => {
    try {
        const query = `
            SELECT e.id_etapa, e.nombre_etapa, e.nombre_encargado, e.correo_encargado
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

/**
 * Método que se encarga de obtener el historial de cambios de una solicitud de la base de datos.
 * @param {string} clave_rastreo - Clave de rastreo de la solicitud sobre la que se quiere obtener su historial de actualizaciones.
 * @returns {Array<<Object>>} Arreglo con todas las actualizaciones que se le han realizado a la solicitud.
 */
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

/**
 * Método que se encarga de cancelar una solicitud especifica en la base de datos.
 * @param {*} clave_rastreo - Clave de rastreo de la solicitud que se quiere cancelar.
 * @returns {boolean} True en caso de que la cancelación se realizó con éxito, False en caso contrario.
 */
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

/**
 * Método que se encarga de obtener el id de un equipo especifico usando su nombre.
 * @param {string} nombre_equipo Nombre del equipo del cual se desea conocer su id.
 * @returns {int} El id perteneciente al equipo con el nombre especificado.
 */
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

/**
 * Método que se encarga de obtener los diferentes tipos de equipos registrados.
 * @returns {map<<Object>>} Mapa con los diferentes tipos de equipos obtenidos.
 */
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

/**
 * Método que se encarga de actualizar una solicitud para registrar un service tag.
 * @param {string} clave_rastreo - Clave de rastreo de la solicitud a actualizar.
 * @param {string} service_tag - Service Tag que se quiere registrar en la solicitud.
 * @returns {boolean} True en caso de que se haya hecho la actualización con éxito, False en caso contrario.
 */
const actualizarServiceTag = async (clave_rastreo, service_tag) => {
    try {
        const [result] = await pool.query(`
            UPDATE solicitudes
            SET service_tag = ?, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE clave_rastreo = ?
        `, [service_tag, clave_rastreo]);

        return result.affectedRows > 0;
    } catch (error) {
        console.error("❌ Error al actualizar el Service Tag:", error);
        throw error;
    }
};

/**
 * Método que se encarga de obtener el service tag de una solicitud con ayuda de su clave de rastreo.
 * @param {string} clave_rastreo - Clave de rastreo de la solcitud.
 * @returns {string} El service tag de la solicitud con la clave de rastreo especificada.
 */
const obtenerServiceTagPorClave = async (clave_rastreo) => {
    try {
        const [rows] = await pool.query(`
            SELECT service_tag
            FROM solicitudes
            WHERE clave_rastreo = ?
        `, [clave_rastreo]);

        return rows.length > 0 ? rows[0].service_tag : null;
    } catch (error) {
        console.error("❌ Error al obtener el Service Tag:", error);
        throw error;
    }
};

module.exports = { actualizarServiceTag, obtenerServiceTagPorClave, crearSolicitud, obtenerEquipos, obtenerTiposEquipo, obtenerSolicitudPorClave, obtenerTodasLasSolicitudes, actualizarEstadoEnBD, cancelarSolicitudEnBD, obtenerHistorialDeSolicitud, obtenerEtapasPorEquipo };


