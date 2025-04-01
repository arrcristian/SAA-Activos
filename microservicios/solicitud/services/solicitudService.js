const { obtenerSolicitudPorClave, actualizarEstadoEnBD, cancelarSolicitudEnBD } = require('../repositories/solicitudRepository');

const ESTADOS = ["pendiente", "en proceso", "finalizado"];

const cambiarEstadoSolicitud = async (clave_rastreo) => {
    const solicitud = await obtenerSolicitudPorClave(clave_rastreo);

    if (!solicitud) {
        return { exito: false, mensaje: "Solicitud no encontrada." };
    }

    const estadoActual = solicitud.estado.toLowerCase();
    const indiceActual = ESTADOS.indexOf(estadoActual);

    if (indiceActual === -1 || indiceActual >= ESTADOS.length - 1) {
        return { exito: false, mensaje: "No es posible cambiar el estado." };
    }

    const nuevoEstado = ESTADOS[indiceActual + 1];

    const actualizado = await actualizarEstadoEnBD(clave_rastreo, nuevoEstado);
    
    return actualizado 
        ? { exito: true, nuevoEstado } 
        : { exito: false, mensaje: "Error al actualizar el estado." };
};

const cancelarSolicitud = async (clave_rastreo) => {
    const solicitud = await obtenerSolicitudPorClave(clave_rastreo);

    if (!solicitud) {
        return false;
    }

    return await cancelarSolicitudEnBD(clave_rastreo);
};

module.exports = { cambiarEstadoSolicitud, cancelarSolicitud };
