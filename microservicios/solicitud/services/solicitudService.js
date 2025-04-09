const { obtenerSolicitudPorClave, actualizarEstadoEnBD, cancelarSolicitudEnBD, obtenerEtapasPorEquipo } = require('../repositories/solicitudRepository');

const encontrarEstadoMasCercano = (estado, etapas) => {
    return etapas.find(etapa => etapa.includes(estado)) || null;
};

const cambiarEstadoSolicitud = async (clave_rastreo) => {
    const solicitud = await obtenerSolicitudPorClave(clave_rastreo);

    if (!solicitud) {
        return { exito: false, mensaje: "Solicitud no encontrada." };
    }

    const { id_etapa, id_equipo } = solicitud;
    if (!id_equipo) {
        return { exito: false, mensaje: "No se ha asignado un equipo a esta solicitud." };
    }

    const etapas = await obtenerEtapasPorEquipo(id_equipo); // ahora devuelve [{ id_etapa, nombre_etapa }, ...]

    if (!etapas || etapas.length === 0) {
        return { exito: false, mensaje: "No se encontraron etapas para el equipo asociado." };
    }

    const indiceActual = etapas.findIndex(e => e.id_etapa === id_etapa);
    if (indiceActual === -1) {
        return { exito: false, mensaje: "La etapa actual no se encuentra en el flujo de etapas del equipo." };
    }

    if (indiceActual >= etapas.length - 2) {
        return { exito: false, mensaje: "La solicitud ya se encuentra en la última etapa." };
    }

    const siguienteEtapa = etapas[indiceActual + 1];
    const actualizado = await actualizarEstadoEnBD(clave_rastreo, siguienteEtapa.id_etapa);

    return actualizado
        ? {
            exito: true,
            mensaje: `Etapa actualizada a "${siguienteEtapa.nombre_etapa}".`,
            nuevaEtapa: siguienteEtapa
        }
        : {
            exito: false,
            mensaje: "Error al actualizar la etapa."
        };
};




const cancelarSolicitud = async (clave_rastreo) => {
    const solicitud = await obtenerSolicitudPorClave(clave_rastreo);

    if (!solicitud) {
        return { exito: false, mensaje: "Solicitud no encontrada." };
    }

    const { id_etapa, id_equipo } = solicitud;
    if (!id_equipo) {
        return { exito: false, mensaje: "No se ha asignado un equipo a esta solicitud." };
    }

    const etapas = await obtenerEtapasPorEquipo(id_equipo); // ahora devuelve [{ id_etapa, nombre_etapa }, ...]

    if (!etapas || etapas.length === 0) {
        return { exito: false, mensaje: "No se encontraron etapas para el equipo asociado." };
    }

    const indiceActual = etapas.findIndex(e => e.id_etapa === id_etapa);
    if (indiceActual === -1) {
        return { exito: false, mensaje: "La etapa actual no se encuentra en el flujo de etapas del equipo." };
    }

    if (indiceActual >= etapas.length - 1) {
        return { exito: false, mensaje: "La solicitud ya se encuentra cancelada." };
    }

    const siguienteEtapa = etapas[etapas.length-1];
    const actualizado = await actualizarEstadoEnBD(clave_rastreo, siguienteEtapa.id_etapa);

    return actualizado
        ? {
            exito: true,
            mensaje: `Etapa actualizada a "${siguienteEtapa.nombre_etapa}".`,
            nuevaEtapa: siguienteEtapa
        }
        : {
            exito: false,
            mensaje: "Error al actualizar la etapa."
        };
};

module.exports = { cambiarEstadoSolicitud, cancelarSolicitud };
