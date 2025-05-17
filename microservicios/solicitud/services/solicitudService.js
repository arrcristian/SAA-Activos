/**
 * ===============================================================
 * Nombre del archivo : solicitudService.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Establece los métodos y la lógica necesaria para manejar las operaciones relacionadas a las solicitudes.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const { obtenerSolicitudPorClave, actualizarEstadoEnBD, obtenerEtapasPorEquipo } = require('../repositories/solicitudRepository');
const sendEmail = require('./emailService');
const path = require("path");

/**
 * Método que se encarga de obtener las etapas validas para un equipo en especifico.
 * @param {int} id_equipo - Id perteneciente al equipo sobre el cual se desean averiguar sus etapas.
 * @returns {Array<<Object>>} Un arreglo que incluye las etapas que pertenecen al equipo especificado.
 */
const obtenerEtapasValidasPorEquipo = async (id_equipo) => {
    const etapas = await obtenerEtapasPorEquipo(id_equipo);
    if (!etapas || etapas.length === 0) return null;
    return etapas;
};

/**
 * Método que se encarga de enviar el correo al encargado de la etapa siguiente.
 * @param {int} etapa - Etapa siguiente.
 * @param {string} clave_rastreo - Clave de rastreo de la solicitud.
 * @returns {Promise<void>}
 */
const enviarCorreoEncargado = async (etapa, clave_rastreo) => {
    if (!etapa?.correo_encargado || !etapa?.nombre_encargado) {
        console.warn("No se envió correo: falta nombre o correo del encargado.");
        return;
    }

    const enlaceAprobar = `${process.env.APP_URL}/api/solicitudes/respuesta?clave_rastreo=${clave_rastreo}&respuesta=si&etapa_esperada=${encodeURIComponent(etapa.nombre_etapa)}`;
    const enlaceRechazar = `${process.env.APP_URL}/api/solicitudes/respuesta?clave_rastreo=${clave_rastreo}&respuesta=no&etapa_esperada=${encodeURIComponent(etapa.nombre_etapa)}`;

    const asunto = `Autorización pendiente: ${etapa.nombre_etapa}`;
    const mensaje = generarEmailAutorizacion(etapa.nombre_encargado, etapa.nombre_etapa, clave_rastreo, enlaceAprobar, enlaceRechazar);

    await sendEmail(etapa.correo_encargado, asunto, mensaje, true);
};

/**
 * Método que se encarga de juntar las partes del email que se enviara al encargado de autorizar el cambio de estado.
 * @param {string} nombreEncargado - Nombre del encargado de la siguiente etapa.
 * @param {string} nombreEtapa - Nombre de la siguiente etapa de la solicitud.
 * @param {string} clave_rastreo - Clave de rastreo de la solicitud.
 * @param {string} enlaceAprobar - Enlace para poder aprobar el cambio de estado.
 * @param {string} enlaceRechazar - Enlace para poder cancelar la solicitud.
 * @returns {string} El correo que se enviara al encargado de autorizar la actualización al siguiente estado.
 */
const generarEmailAutorizacion = (nombreEncargado, nombreEtapa, clave_rastreo, enlaceAprobar, enlaceRechazar) => {
    return `
    <html>
    <body>
        <p>Estimado(a) ${nombreEncargado},</p>
        <p>La solicitud con clave de rastreo <strong>${clave_rastreo}</strong> ha avanzado y requiere su intervención.</p>
        <p>Se necesita la <strong>${nombreEtapa.toLowerCase()}</strong>. Elija una de las siguientes opciones:</p>
        <p>
            <a href="${enlaceAprobar}" style="display:inline-block;padding:10px;background-color:green;color:white;text-decoration:none;border-radius:5px;">
                ✅ Autorizar
            </a>
            &nbsp;&nbsp;
            <a href="${enlaceRechazar}" style="display:inline-block;padding:10px;background-color:red;color:white;text-decoration:none;border-radius:5px;">
                ❌ Cancelar
            </a>
        </p>
        <p>Saludos cordiales,<br>Equipo de Soporte Técnico</p>
    </body>
    </html>
    `;
};

/**
 * Método que se encarga de manejar la lógica necesaria para poder cambiar el estado de una solicitud.
 * @param {string} clave_rastreo - Clave de rastreo de la solicitud a actualizar.
 * @returns {Object} Objeto que contiene el resultado obtenido al intentar cambiar el estado de la solicitud.
 */
const cambiarEstadoSolicitud = async (clave_rastreo) => {
    const solicitud = await obtenerSolicitudPorClave(clave_rastreo);
    if (!solicitud) return { exito: false, mensaje: "Solicitud no encontrada." };

    const { id_etapa, id_equipo } = solicitud;
    if (!id_equipo) return { exito: false, mensaje: "No se ha asignado un equipo a esta solicitud." };

    const etapas = await obtenerEtapasValidasPorEquipo(id_equipo);
    if (!etapas) return { exito: false, mensaje: "No se encontraron etapas para el equipo asociado." };

    const indiceActual = etapas.findIndex(e => e.id_etapa === id_etapa);
    if (indiceActual === -1) return { exito: false, mensaje: "Etapa actual no válida." };

    // ❌ Ya está en la última etapa
    if (indiceActual === etapas.length - 2) {
        return { exito: false, mensaje: "La solicitud ya se encuentra en la última etapa." };
    }

    const siguienteEtapa = etapas[indiceActual + 1];
    const actualizado = await actualizarEstadoEnBD(clave_rastreo, siguienteEtapa.id_etapa);

    if (actualizado) {
        // ⚠️ Solo se envía correo si hay una etapa después
        if (etapas[indiceActual + 2]) {
            await enviarCorreoEncargado(etapas[indiceActual + 2], clave_rastreo);
        }

        return {
            exito: true,
            mensaje: `Etapa actualizada a "${siguienteEtapa.nombre_etapa}".`,
            nuevaEtapa: siguienteEtapa
        };
    }

    return { exito: false, mensaje: "Error al cambiar el estado de la solicitud" };
};

/**
 * Método que se encarga de cancelar una solicitud.
 * @param {string} clave_rastreo - Clave de rastreo de la solicitud que se desea cancelar.
 * @returns {Object} Objeto que contiene el resultado obtenido al intentar cancelar la solicitud.
 */
const cancelarSolicitud = async (clave_rastreo) => {
    const solicitud = await obtenerSolicitudPorClave(clave_rastreo);
    if (!solicitud) return { exito: false, mensaje: "Solicitud no encontrada." };

    const { id_etapa, id_equipo } = solicitud;
    if (!id_equipo) return { exito: false, mensaje: "No se ha asignado un equipo a esta solicitud." };

    const etapas = await obtenerEtapasValidasPorEquipo(id_equipo);
    if (!etapas) return { exito: false, mensaje: "No se encontraron etapas para el equipo asociado." };

    const indiceActual = etapas.findIndex(e => e.id_etapa === id_etapa);
    if (indiceActual === -1 || indiceActual >= etapas.length - 1) {
        return { exito: false, mensaje: "La solicitud ya se encuentra cancelada o etapa inválida." };
    }

    const etapaFinal = etapas[etapas.length - 1];
    const actualizado = await actualizarEstadoEnBD(clave_rastreo, etapaFinal.id_etapa);

    if (actualizado) {
        const emailBody = `
            <p>Hola ${solicitud.usuario},</p>
            <p>Tu solicitud con clave de rastreo <strong>${clave_rastreo}</strong> ha sido <strong>cancelada</strong>.</p>
            <p>Si tienes dudas, contáctanos.</p>
            <p>Saludos,<br>Equipo de Soporte Técnico</p>
        `;
        await sendEmail(solicitud.email, "Cancelación de solicitud", emailBody, true);
        return { exito: true, mensaje: `Solicitud cancelada.`, nuevaEtapa: etapaFinal };
    }

    return { exito: false, mensaje: "Error al cancelar la solicitud" };
};

/**
 * Método que se encarga de manejar toda la lógica necesaria para poder finalizar una solicitud.
 * @param {string} clave_rastreo - Clave de rastreo de la solicitud a finalizar.
 * @param {string} correoEmpleado - Correo del empleado a quien se le enviara el correo.
 * @param {string} imagenCarta - Ruta de la imagen de la carta compromiso que se enviara.
 * @param {string} nombre - Nombre del empleado.
 * @returns {Object} Objeto con el resultado obtenido al intentar finalizar la solicitud.
 */
const finalizarSolicitudConCorreo = async (clave_rastreo, correoEmpleado, imagenCarta, nombre) => {
    const actualizado = await cambiarEstadoSolicitud(clave_rastreo);

    if (!actualizado.exito) {
        return { exito: false, mensaje: "No se pudo finalizar la solicitud." };
    }

    const nombreImagen = imagenCarta + ".jpg";

    // Ruta absoluta al archivo, ajusta si está en otra carpeta
    const rutaImagen = path.resolve(__dirname, "../../../images", imagenCarta + ".jpg");

    // HTML del mensaje con referencia CID
    const mensaje = `
        <p>Hola ${nombre},</p>
        <p>Tu solicitud con clave <strong>${clave_rastreo}</strong> ha sido <strong>finalizada</strong>.</p>
        <p>Adjunto encontrarás la carta compromiso.</p>
        <p>Saludos,<br>Equipo de Soporte Técnico</p>
        <img src="cid:carta_compromiso" style="max-width:600px; margin-top:20px;" alt="Carta compromiso" />
    `;

    // Envío del correo con la imagen embebida
    await sendEmail(
        correoEmpleado,
        "Finalización de solicitud y carta compromiso",
        mensaje,
        true,
        [
            {
                filename: nombreImagen,
                path: rutaImagen,
                cid: "carta_compromiso"
            }
        ]
    );

    return { exito: true };
};

const validarYActualizarEstado = async (clave_rastreo, etapa_esperada) => {
    const solicitud = await obtenerSolicitudPorClave(clave_rastreo);
    if (!solicitud) return { exito: false, mensaje: "Solicitud no encontrada." };

    const { id_etapa, id_equipo } = solicitud;
    const etapas = await obtenerEtapasValidasPorEquipo(id_equipo);
    const indiceActual = etapas.findIndex(e => e.id_etapa === id_etapa);

    if (indiceActual === -1) return { exito: false, mensaje: "Etapa actual no válida." };
    const siguienteEtapa = etapas[indiceActual + 1];

    if (!siguienteEtapa || siguienteEtapa.nombre_etapa !== etapa_esperada) {
        return { exito: false, mensaje: "No tienes autorización para cambiar a esta etapa." };
    }

    return await cambiarEstadoSolicitud(clave_rastreo);
};

const validarYCancelarSolicitud = async (clave_rastreo, etapa_esperada) => {
    const solicitud = await obtenerSolicitudPorClave(clave_rastreo);
    if (!solicitud) return { exito: false, mensaje: "Solicitud no encontrada." };

    const { id_etapa, id_equipo } = solicitud;
    const etapas = await obtenerEtapasValidasPorEquipo(id_equipo);
    const indiceActual = etapas.findIndex(e => e.id_etapa === id_etapa);

    if (indiceActual === -1) return { exito: false, mensaje: "Etapa actual no válida." };
    const siguienteEtapa = etapas[indiceActual + 1];

    if (!siguienteEtapa || siguienteEtapa.nombre_etapa !== etapa_esperada) {
        return { exito: false, mensaje: "No tienes autorización para cancelar esta solicitud en esta etapa." };
    }

    return await cancelarSolicitud(clave_rastreo);
};


module.exports = {
    finalizarSolicitudConCorreo,
    cambiarEstadoSolicitud,
    cancelarSolicitud,
    obtenerEtapasValidasPorEquipo, 
    enviarCorreoEncargado,
    validarYActualizarEstado,
    validarYCancelarSolicitud
};
