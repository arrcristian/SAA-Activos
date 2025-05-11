const { obtenerSolicitudPorClave, actualizarEstadoEnBD, cancelarSolicitudEnBD, obtenerEtapasPorEquipo } = require('../repositories/solicitudRepository');
const sendEmail = require('./emailService');

/**
 * Devuelve las etapas válidas asociadas a un equipo.
 */
const obtenerEtapasValidasPorEquipo = async (id_equipo) => {
    const etapas = await obtenerEtapasPorEquipo(id_equipo);
    if (!etapas || etapas.length === 0) return null;
    return etapas;
};

/**
 * Genera y envía un correo de autorización al encargado de una etapa.
 */
const enviarCorreoEncargado = async (etapa, clave_rastreo) => {
    if (!etapa?.correo_encargado || !etapa?.nombre_encargado) {
        console.warn("No se envió correo: falta nombre o correo del encargado.");
        return;
    }

    const enlaceAprobar = `${process.env.APP_URL}/api/solicitudes/respuesta?clave_rastreo=${clave_rastreo}&respuesta=si`;
    const enlaceRechazar = `${process.env.APP_URL}/api/solicitudes/respuesta?clave_rastreo=${clave_rastreo}&respuesta=no`;

    const asunto = `Autorización pendiente: ${etapa.nombre_etapa}`;
    const mensaje = generarEmailAutorizacion(etapa.nombre_encargado, etapa.nombre_etapa, clave_rastreo, enlaceAprobar, enlaceRechazar);

    await sendEmail(etapa.correo_encargado, asunto, mensaje, true);
};

/**
 * Construye el cuerpo del email en HTML.
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
 * Cambia el estado de una solicitud a la siguiente etapa.
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
 * Cancela una solicitud.
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

const finalizarSolicitudConCorreo = async (clave_rastreo, correoEmpleado, imagenCarta, nombre) => {
    const actualizado = await cambiarEstadoSolicitud(clave_rastreo);

    if (!actualizado.exito) {
        return { exito: false, mensaje: "No se pudo finalizar la solicitud." };
    }

    imagenCarta = imagenCarta + ".jpg";
    const mensaje = `
        <p>Hola ${nombre},</p>
        <p>Tu solicitud con clave <strong>${clave_rastreo}</strong> ha sido <strong>finalizada</strong>.</p>
        <p>Adjunto encontrarás la carta compromiso.</p>
        <p>Saludos,<br>Equipo de Soporte Técnico</p>
        <img src="${imagenCarta}" style="max-width:600px; margin-top:20px;" alt="Carta compromiso" />
    `;

    await sendEmail(correoEmpleado, "Finalización de solicitud y carta compromiso", mensaje, true);

    return { exito: true };
};

module.exports = {
    finalizarSolicitudConCorreo,
    cambiarEstadoSolicitud,
    cancelarSolicitud,
    obtenerEtapasValidasPorEquipo, // opcional exportar
    enviarCorreoEncargado // opcional exportar
};
