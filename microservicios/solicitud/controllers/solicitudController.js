const Solicitud = require('../models/solicitudModel');
const { obtenerCorreoSupervisor } = require('../repositories/contactoRepository');
const { crearSolicitud, obtenerTodasLasSolicitudes, actualizarEstadoEnBD, obtenerSolicitudPorClave, obtenerHistorialDeSolicitud, cancelarSolicitudEnBD } = require('../repositories/solicitudRepository');
const sendEmail = require('../services/emailService');
const { cambiarEstadoSolicitud, cancelarSolicitud } = require('../services/solicitudService');
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

            // Obtener correo del supervisor
            const supervisor = await obtenerCorreoSupervisor(departamento);

            if (supervisor) {
                // Crear enlaces de aprobación y cancelación
                const enlaceAprobar = `${process.env.APP_URL}/api/solicitudes/respuesta?clave_rastreo=${tracking_id}&respuesta=si`;
                const enlaceRechazar = `${process.env.APP_URL}/api/solicitudes/respuesta?clave_rastreo=${tracking_id}&respuesta=no`;

                const asuntoSupervisor = "Nueva Solicitud Pendiente";
                const mensajeSupervisor = `
    <html>
    <body>
        <p>Hola ${supervisor.nombre},</p>
        <p>Se ha generado una nueva solicitud.</p>
        <p><strong>Clave de rastreo:</strong> ${tracking_id}</p>
        <p><strong>Usuario:</strong> ${usuario}</p>
        <p><strong>Departamento:</strong> ${departamento}</p>
        <p><strong>Equipo ID:</strong> ${equipo_id}</p>
        <p>¿Deseas aprobar o cancelar la solicitud?</p>
        <p>
            <a href="${enlaceAprobar}" style="display:inline-block;padding:10px;background-color:green;color:white;text-decoration:none;border-radius:5px;">
                ✅ Aprobar
            </a> 
            &nbsp;&nbsp;
            <a href="${enlaceRechazar}" style="display:inline-block;padding:10px;background-color:red;color:white;text-decoration:none;border-radius:5px;">
                ❌ Rechazar
            </a>
        </p>
    </body>
    </html>
`;
                await sendEmail(supervisor.email, asuntoSupervisor, mensajeSupervisor, true);
            }

            return res.status(201).json({ mensaje: "Solicitud creada con éxito", tracking_id });
        } else {
            return res.status(500).json({ error: "No se pudo crear la solicitud." });
        }
    } catch (error) {
        console.error("Error en el controlador al crear la solicitud:", error);
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
            nuevoEstado="actualizada";
        } else if (respuesta === "no") {
            actualizado = await cancelarSolicitud(clave_rastreo);
            nuevoEstado="cancelada";
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

module.exports = { crearNuevaSolicitud, obtenerSolicitudes, obtenerSeguimiento, procesarRespuestaCorreo, actualizarEstado, cancelar };



