const Solicitud = require('../models/solicitudModel');
const { obtenerCorreoSupervisor } = require('../repositories/contactoRepository');
const { actualizarServiceTag, obtenerServiceTagPorClave, crearSolicitud, obtenerTodasLasSolicitudes, actualizarEstadoEnBD, obtenerSolicitudPorClave, obtenerHistorialDeSolicitud, cancelarSolicitudEnBD, obtenerTiposEquipo } = require('../repositories/solicitudRepository');
const sendEmail = require('../services/emailService');
const { finalizarSolicitudConCorreo, cambiarEstadoSolicitud, cancelarSolicitud, enviarCorreoEncargado, obtenerEtapasValidasPorEquipo } = require('../services/solicitudService');
const crypto = require('crypto');

// Función para generar un Tracking ID único
const generarTrackingId = () => crypto.randomBytes(6).toString('hex').toUpperCase();

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

const procesarRespuestaCorreo = async (req, res) => {
    try {
        const { clave_rastreo, respuesta } = req.query;

        if (!clave_rastreo || !respuesta) {
            return res.status(400).send("Solicitud inválida.");
        }

        let nuevoEstado = null;
        let actualizado;
        if (respuesta === "si") {
            actualizado = await cambiarEstadoSolicitud(clave_rastreo);
            nuevoEstado = "actualizada";
        } else if (respuesta === "no") {
            actualizado = await cancelarSolicitud(clave_rastreo);
            nuevoEstado = "cancelada";
        } else {
            return res.status(400).send("Respuesta no válida.");
        }

        if (actualizado.exito) {
            return res.send(`✅ La solicitud con clave ${clave_rastreo} ha sido ${nuevoEstado}.`);
        } else {
            return res.status(404).send("❌ No se encontró la solicitud.");
        }
    } catch (error) {
        console.error("❌ Error procesando respuesta del correo:", error);
        return res.status(500).send("Error interno del servidor.");
    }
};

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


const getTiposEquipo = async (req, res) => {
    try {
        const tipos = await obtenerTiposEquipo();
        res.json(tipos);
    } catch (error) {
        console.error("❌ Error en getTiposEquipo:", error);
        res.status(500).json({ error: "Error al obtener los tipos de equipo" });
    }
};

// Actualizar el Service Tag
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

// Obtener el Service Tag
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



