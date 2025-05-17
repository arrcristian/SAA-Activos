/**
 * ===============================================================
 * Nombre del archivo : solicitudController.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Contiene metodos para manejar las peticiones relacionadas con las solicitudes.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const Solicitud = require('../models/solicitudModel');
const { actualizarServiceTag, obtenerServiceTagPorClave, crearSolicitud, obtenerTodasLasSolicitudes, actualizarEstadoEnBD, obtenerSolicitudPorClave, obtenerHistorialDeSolicitud, obtenerTiposEquipo } = require('../repositories/solicitudRepository');
const sendEmail = require('../services/emailService');
const { finalizarSolicitudConCorreo, cambiarEstadoSolicitud, cancelarSolicitud, enviarCorreoEncargado, obtenerEtapasValidasPorEquipo, validarYActualizarEstado, validarYCancelarSolicitud } = require('../services/solicitudService');
const crypto = require('crypto');

/**
 * Función para generar la clave de rastreo única e irrepetible.
 * @returns {string} Clave de rastreo generada.
 */
const generarTrackingId = () => crypto.randomBytes(6).toString('hex').toUpperCase();

/**
 * Método que se encarga de llamar al metodo necesario para crear una nueva solicitud y enviar los correos necesarios.
 * @param {import('express').Request} req - Objeto de solicitud HTTP que contiene los datos de la solicitud necesarios para crearla.
 * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa el resultado obtenido.
 * @returns {Promise<void>} 
 */
const crearNuevaSolicitud = async (req, res) => {
    try {
        const { ticket_id, numero_ticket, usuario, email, resolutor, topico, departamento, equipo_id } = req.body;

        if (!ticket_id || !numero_ticket || !usuario || !email || !resolutor || !topico || !departamento || !equipo_id) {
            return res.status(400).json({ error: "Faltan datos requeridos." });
        }

        // Generar tracking ID
        const tracking_id = generarTrackingId();
        const nuevaSolicitud = new Solicitud(tracking_id, ticket_id, usuario, email, resolutor, topico, departamento, equipo_id);

        // Guardar en la base de datos
        const guardado = await crearSolicitud(nuevaSolicitud);

        if (guardado) {
            // Enviar correo al usuario confirmando la solicitud
            const asuntoUsuario = "Confirmación de solicitud";
            const mensajeUsuario = `Hola ${usuario},\n\nTu solicitud ha sido registrada exitosamente.\n\nClave de rastreo: ${tracking_id}\n\nGracias por usar nuestro servicio.`;

            await sendEmail(email, asuntoUsuario, mensajeUsuario, false);

            const etapas = await obtenerEtapasValidasPorEquipo(equipo_id);
            if (!etapas) return res.status(400).json({ error: "No se encontraron las etapas para el equipo requerido." });
            await enviarCorreoEncargado(etapas[1], tracking_id);
        }
    } catch (error) {
        console.error("Error en el controlador al crear la solicitud:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
};

/**
 * Método que se encarga de llamar a los métodos necesarios para finalizar una solicitud.
 * @param {import('express').Request} req - Objeto de solicitud HTTP que contiene los datos de la solicitud necesarios para finalizarla.
 * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa el resultado obtenido.
 * @returns {Promise<void>} 
 */
const finalizarSolicitud = async (req, res) => {
    try {
        const { clave_rastreo } = req.params;
        const { correoEmpleado, imagen, nombre } = req.body;

        if (!clave_rastreo || !correoEmpleado || !imagen || !nombre) {
            return res.status(400).json({ error: "Faltan datos obligatorios." });
        }

        const resultado = await finalizarSolicitudConCorreo(clave_rastreo, correoEmpleado, imagen, nombre);

        if (resultado.exito) {
            return res.status(200).json({ mensaje: "Solicitud finalizada y correo enviado." });
        } else {
            return res.status(400).json({ error: resultado.mensaje });
        }
    } catch (error) {
        console.error("❌ Error en finalizarSolicitudController:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
};

/**
 * Método que se encarga de llamar al método necesario para obtener las solicitudes activas.
 * @param {import('express').Request} req - Objeto de solicitud HTTP.
 * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa las solicitudes encontradas en formato JSON..
 * @returns {Promise<void>} 
 */
const obtenerSolicitudes = async (req, res) => {
    try {
        const solicitudes = await obtenerTodasLasSolicitudes();

        if (!solicitudes || solicitudes.length === 0) {
            console.log("⚠️ No hay solicitudes registradas.");
            return res.status(404).json({ error: "No hay solicitudes disponibles." });
        }

        return res.status(200).json(solicitudes);
    } catch (error) {
        console.error("❌ Error en obtenerSolicitudes:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
};

/**
 * Función que se encarga de llamar a los métodos necesarios para obtener el historial de seguimiento de una solicitud.
 * @param {import('express').Request} req - Objeto de solicitud HTTP que contiene la clave de rastreo de la solicitud.
 * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa las solicitudes encontradas.
 * @returns {Promise<void>} 
 */
const obtenerSeguimiento = async (req, res) => {
    try {
        const { clave_rastreo } = req.params;

        if (!clave_rastreo) {
            return res.status(400).json({ error: "La clave de rastreo es obligatoria." });
        }

        const solicitud = await obtenerSolicitudPorClave(clave_rastreo);
        if (!solicitud) {
            console.log("⚠️ No se encontró ninguna solicitud con esa clave.");
            return res.status(404).json({ error: "Solicitud no encontrada." });
        }

        const historial = await obtenerHistorialDeSolicitud(clave_rastreo);

        return res.status(200).json({
            ticket_id: solicitud.ticket_id,
            usuario: solicitud.usuario,
            resolutor: solicitud.resolutor,
            estado_actual: solicitud.estado,
            fecha_creacion: solicitud.fecha_creacion,
            tipo_equipo: solicitud.tipo_equipo,
            historial
        });
    } catch (error) {
        console.error("❌ Error en obtenerSeguimiento:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
};

/**
 * Función que se encarga de manejar la lógica de las respuestas a los correos automatizados enviados.
 * @param {import('express').Request} req - Objeto de solicitud HTTP que contiene la clave de rastreo de la solicitud y la respuesta obtenida.
 * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa el resultado obtenido.
 * @returns {Promise<void>} 
 */
const procesarRespuestaCorreo = async (req, res) => {
    try {
        const { clave_rastreo, respuesta, etapa_esperada } = req.query;

        if (!clave_rastreo || !respuesta || !etapa_esperada) {
            return res.status(400).send("Solicitud inválida.");
        }

        let resultado;
        if (respuesta === "si") {
            resultado = await validarYActualizarEstado(clave_rastreo, etapa_esperada);
        } else if (respuesta === "no") {
            resultado = await validarYCancelarSolicitud(clave_rastreo, etapa_esperada);
        } else {
            return res.status(400).send("Respuesta no válida.");
        }

        if (resultado.exito) {
            return res.send(`✅ La solicitud con clave ${clave_rastreo} ha sido procesada correctamente.`);
        } else {
            return res.status(403).send(`❌ ${resultado.mensaje}`);
        }

    } catch (error) {
        console.error("❌ Error procesando respuesta del correo:", error);
        return res.status(500).send("Error interno del servidor.");
    }
};

/**
 * Función que se encarga de llamar a los métodos necesarios para actualizar el estado de una solicitud.
 * @param {import('express').Request} req - Objeto de solicitud HTTP que contiene la clave de rastreo de la solicitud.
 * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa el resultado obtenido.
 * @returns {Promise<void>} 
 */
const actualizarEstado = async (req, res) => {
    try {
        const { clave_rastreo } = req.params;

        if (!clave_rastreo) {
            return res.status(400).json({ error: "La clave de rastreo es obligatoria." });
        }

        const resultado = await cambiarEstadoSolicitud(clave_rastreo);

        if (resultado.exito) {
            return res.status(200).json({ mensaje: "Estado actualizado correctamente.", nuevoEstado: resultado.nuevoEstado });
        } else {
            return res.status(400).json({ error: resultado.mensaje });
        }
    } catch (error) {
        console.error("❌ Error en actualizarEstado:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
};

/**
 * Función que se encarga de llamar al método apropiado para cancelar una solicitud.
 * @param {import('express').Request} req - Objeto de solicitud HTTP que contiene la clave de rastreo de la solicitud.
 * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa el resultado obtenido.
 * @returns {Promise<void>} 
 */
const cancelar = async (req, res) => {
    try {
        const { clave_rastreo } = req.params;

        if (!clave_rastreo) {
            return res.status(400).json({ error: "La clave de rastreo es obligatoria." });
        }

        const resultado = await cancelarSolicitud(clave_rastreo);

        if (resultado) {
            return res.status(200).json({ mensaje: "Solicitud cancelada correctamente." });
        } else {
            return res.status(400).json({ error: "No se pudo cancelar la solicitud." });
        }
    } catch (error) {
        console.error("❌ Error en cancelar:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
};

/**
 * Función que se encarga de obtener los tipos de equipo que se encuentran registrados actualmente.
 * @param {import('express').Request} req - Objeto de solicitud HTTP.
 * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa los equipos obtenidos en formato JSON.
 */
const getTiposEquipo = async (req, res) => {
    try {
        const tipos = await obtenerTiposEquipo();
        res.json(tipos);
    } catch (error) {
        console.error("❌ Error en getTiposEquipo:", error);
        res.status(500).json({ error: "Error al obtener los tipos de equipo" });
    }
};

/**
 * Función que llama al método apropiado para registrar el service tag en una solicitud existente.
 * @param {import('express').Request} req - Objeto de solicitud HTTP que contiene la clave de rastreo de la solicitud y el service tag.
 * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa el resultado obtenido.
 * @returns {Promise<void>} 
 */
const actualizarServiceTagController = async (req, res) => {
    const { clave_rastreo } = req.params;
    const { service_tag } = req.body;

    if (!service_tag) {
        return res.status(400).json({ error: "El campo 'service_tag' es requerido." });
    }

    try {
        const actualizado = await actualizarServiceTag(clave_rastreo, service_tag);
        if (actualizado) {
            return res.status(200).json({ mensaje: "Service Tag actualizado correctamente." });
        } else {
            return res.status(404).json({ error: "No se encontró la solicitud o no se pudo actualizar." });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error al actualizar el Service Tag." });
    }
};

/**
 * Función que se encarga de llamar al método para obtener el service tag que tiene registrado una solicitud.
 * @param {import('express').Request} req - Objeto de solicitud HTTP que contiene la clave de rastreo de la solicitud.
 * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa el service tag de la solicitud en formato JSON.
 * @returns {Promise<void>} 
 */
const obtenerServiceTagController = async (req, res) => {
    const { clave_rastreo } = req.params;

    try {
        const service_tag = await obtenerServiceTagPorClave(clave_rastreo);
        if (service_tag) {
            return res.status(200).json({ service_tag });
        } else {
            return res.status(404).json({ error: "No se encontró el Service Tag para esta solicitud." });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error al obtener el Service Tag." });
    }
};

module.exports = { finalizarSolicitud, actualizarServiceTagController, obtenerServiceTagController, crearNuevaSolicitud, obtenerSolicitudes, obtenerSeguimiento, procesarRespuestaCorreo, actualizarEstado, cancelar, getTiposEquipo };



