document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const claveRastreo = urlParams.get("clave");

    if (!claveRastreo || claveRastreo.trim() === "") {
        await Swal.fire({
            icon: 'warning',
            title: 'Clave no proporcionada',
            text: 'Debe proporcionar una clave de rastreo.'
        });
        window.location.href = "seguimiento.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:4000/api/solicitudes/seguimiento/${claveRastreo}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Error al obtener la solicitud");

        // Insertar datos en la página
        document.getElementById("ticket_id").textContent = claveRastreo;
        document.getElementById("usuario").textContent = data.usuario;
        document.getElementById("resolutor").textContent = data.resolutor;
        document.getElementById("fecha_creacion").textContent = formatearFecha(data.fecha_creacion);
        document.getElementById("tipo_equipo").textContent = data.tipo_equipo || "No especificado";

        const historial = data.historial;
        if (historial && historial.length > 0) {
            const ultimaEtapa = historial[historial.length - 1];
            document.getElementById("estado_actual").textContent = ultimaEtapa.nombre_etapa || "Sin estado";
        } else {
            document.getElementById("estado_actual").textContent = "Sin historial";
        }

        // Llenar historial
        const historialContainer = document.getElementById("historial");
        historialContainer.innerHTML = ""; // Limpiar contenido anterior
        console.log("Historial recibido:", data.historial);
        data.historial.forEach(actualizacion => {
            const fechaFormateada = formatearFecha(actualizacion.fecha_cambio);
            const row = document.createElement("tr");
            row.innerHTML = `<td>${actualizacion.nombre_etapa}</td><td>${fechaFormateada}</td>`;
            historialContainer.appendChild(row);
        });

    } catch (error) {
        console.error("❌ Error al cargar detalles:", error);
        await Swal.fire({
            icon: 'error',
            title: 'Error de consulta',
            text: 'No se pudo obtener la solicitud. Intente nuevamente.'
        });
        window.location.href = "seguimiento.html";
    }
});

function formatearFecha(fechaISO) {
    if (!fechaISO) return "Fecha no disponible";

    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const año = fecha.getFullYear();
    const horas = String(fecha.getHours()).padStart(2, "0");
    const minutos = String(fecha.getMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${año} | ${horas}:${minutos}`;
}