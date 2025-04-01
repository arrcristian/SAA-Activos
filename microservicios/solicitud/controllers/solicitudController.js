const Solicitud = require('../models/solicitudModel');
const { crearSolicitud } = require('../repositories/solicitudRepository');
const sendEmail = require('../services/emailService'); // Importación corregida
const { crearSolicitud, actualizarEstadoEnBD, obtenerSolicitudPorClave, obtenerHistorialDeSolicitud } = require('../repositories/solicitudRepository');
const { obtenerCorreoSupervisor } = require('../repositories/contactoRepository');
const sendEmail = require('../services/emailService');
const { cambiarEstadoSolicitud, cancelarSolicitud } = require('../services/solicitudService');
const crypto = require('crypto');

// Función para generar un Tracking ID único
const generarTrackingId = () => crypto.randomBytes(6).toString('hex').toUpperCase();

const crearNuevaSolicitud = async (req, res) => {
    try {
        const { ticket_id, numero_ticket, usuario, email, resolutor , topico, departamento} = req.body;

        if (!ticket_id || !numero_ticket || !usuario || !email || !resolutor || !topico || !departamento) {
            return res.status(400).json({ error: "Faltan datos requeridos." });
        }

        // Generar tracking ID
        const tracking_id = generarTrackingId();
        //const tracking_id = numero_ticket;
        const nuevaSolicitud = new Solicitud(tracking_id, ticket_id, usuario, email, resolutor, topico, departamento);

        // Guardar en la base de datos
        const guardado = await crearSolicitud(nuevaSolicitud);

        if (guardado) {
            // Enviar correo con la clave de rastreo
            const asunto = "Confirmación de solicitud";
            const mensaje = `Hola ${usuario},\n\nTu solicitud ha sido registrada exitosamente.\n\nClave de rastreo: ${tracking_id}\n\nGracias por usar nuestro servicio.`;
            
            await sendEmail(email, asunto, mensaje);

            return res.status(201).json({ mensaje: "Solicitud creada con éxito", tracking_id });
        } else {
            return res.status(500).json({ error: "No se pudo crear la solicitud." });
        }
    } catch (error) {
        console.error("Error en el controlador al crear la solicitud:", error);
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

        if (respuesta === "si") {
            nuevoEstado = "en proceso";
        } else if (respuesta === "no") {
            nuevoEstado = "cancelado";
        } else {
            return res.status(400).send("Respuesta no válida.");
        }

        const actualizado = await actualizarEstadoEnBD(clave_rastreo, nuevoEstado);

        if (actualizado) {
            return res.send(`✅ La solicitud con clave ${clave_rastreo} ha sido actualizada a: ${nuevoEstado}.`);
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

module.exports = { crearNuevaSolicitud, obtenerSeguimiento, procesarRespuestaCorreo, actualizarEstado, cancelar };

