//Validar el token antes de permitir acceso a la página
(async function validarToken() {
    const token = sessionStorage.getItem("token");
    if (!token || token.trim() === "") {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/api/usuarios/perfil", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Token inválido");

        const data = await response.json();
        sessionStorage.setItem("usuario", data.usuario.usuario);
    } catch (error) {
        console.error("Token inválido:", error.message);
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("usuario");
        window.location.href = "login.html";
    }
})();

const solicitudesPorPagina = 10;
let paginaActual = 1;
let todasLasSolicitudes = []; // Para mantener todas las solicitudes en memoria

function obtenerNombreUsuario() {
    const usuario = sessionStorage.getItem("usuario");
    document.getElementById("bienvenida").textContent =
        usuario && usuario.trim() !== "" ? `Bienvenido, ${usuario}` : "Bienvenido, Resolutor";
}

async function cargarSolicitudes() {
    try {
        const response = await fetch('http://localhost:4000/api/solicitudes/obtener');
        const solicitudes = await response.json();
        if (!response.ok) throw new Error(solicitudes.error || "Error al obtener las solicitudes");

        todasLasSolicitudes = solicitudes;
        mostrarSolicitudes(todasLasSolicitudes);
    } catch (error) {
        console.error("❌ Error al cargar solicitudes:", error);
    }
}

function mostrarSolicitudes(solicitudes, pagina = 1) {
    const tabla = document.getElementById('solicitudesTabla');
    tabla.innerHTML = "";

    // Ordenar por fecha de última actualización ASC (más vieja primero)
    solicitudes.sort((a, b) => new Date(a.fecha_actualizacion) - new Date(b.fecha_actualizacion));

    // Paginación
    const inicio = (pagina - 1) * solicitudesPorPagina;
    const fin = inicio + solicitudesPorPagina;
    const solicitudesPagina = solicitudes.slice(inicio, fin);


    solicitudesPagina.forEach(solicitud => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><strong>${solicitud.clave_rastreo}</strong></td>
            <td>${solicitud.usuario}</td>
            <td>${solicitud.estado}</td>
            <td>${solicitud.tipo_equipo || 'No especificado'}</td>
            <td>${formatearFecha(solicitud.fecha_creacion)}</td>
            <td>${formatearFecha(solicitud.fecha_actualizacion)}</td>
            <td><button onclick="verDetalles('${solicitud.clave_rastreo}')">Detalles</button></td>
        `;
        tabla.appendChild(fila);
    });

    actualizarInfoRango(solicitudes.length, pagina);
    generarControlesPaginacion(solicitudes.length, pagina);
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return "No disponible";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-MX", {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function generarControlesPaginacion(totalSolicitudes, paginaActual) {
    const contenedor = document.getElementById("paginacion");
    contenedor.innerHTML = "";

    const totalPaginas = Math.ceil(totalSolicitudes / solicitudesPorPagina);

    if (totalPaginas <= 1) return; // No mostrar si solo hay una página

    const crearBoton = (texto, pagina, deshabilitado = false) => {
        const boton = document.createElement("button");
        boton.textContent = texto;
        boton.disabled = deshabilitado;
        boton.onclick = () => mostrarSolicitudes(filtrarSolicitudesActuales(), pagina);
        return boton;
    };

    contenedor.appendChild(crearBoton("Anterior", paginaActual - 1, paginaActual === 1));

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = crearBoton(i, i);
        if (i === paginaActual) {
            btn.style.fontWeight = "bold";
            btn.style.backgroundColor = "#007bff";
            btn.style.color = "white";
        }
        contenedor.appendChild(btn);
    }

    contenedor.appendChild(crearBoton("Siguiente", paginaActual + 1, paginaActual === totalPaginas));
}

function actualizarInfoRango(total, pagina) {
    const inicio = (pagina - 1) * solicitudesPorPagina + 1;
    const fin = Math.min(inicio + solicitudesPorPagina - 1, total);
    const info = document.getElementById("infoRango");

    if (total === 0) {
        info.textContent = "No hay solicitudes para mostrar.";
    } else {
        info.textContent = `Mostrando solicitudes ${inicio}–${fin} de ${total}`;
    }
}

async function cargarTiposEquipo() {
    try {
        const response = await fetch('http://localhost:4000/api/solicitudes/tipos');
        const tipos = await response.json();
        if (!response.ok) throw new Error(tipos.error || "Error al obtener tipos de equipo");

        const select = document.getElementById("filtroEquipo");
        select.innerHTML = '<option value="">Todos los equipos</option>';

        tipos.forEach(tipo => {
            const option = document.createElement("option");
            option.value = tipo;
            option.textContent = tipo;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("❌ Error al cargar tipos de equipo:", error);
    }
}

function filtrarPorEquipo() {
    const tipoSeleccionado = document.getElementById("filtroEquipo").value;
    const filtradas = tipoSeleccionado === ""
        ? todasLasSolicitudes
        : todasLasSolicitudes.filter(solicitud => solicitud.tipo_equipo === tipoSeleccionado);

    paginaActual = 1;
    mostrarSolicitudes(filtradas, paginaActual);
}

function filtrarSolicitudesActuales() {
    const tipoSeleccionado = document.getElementById("filtroEquipo").value;
    return tipoSeleccionado === ""
        ? todasLasSolicitudes
        : todasLasSolicitudes.filter(s => s.tipo_equipo === tipoSeleccionado);
}

function verDetalles(claveRastreo) {
    window.location.href = `seguimiento_resolutores.html?clave=${claveRastreo}`;
}

async function buscarSolicitud() {
    const input = document.getElementById("buscarClave");
    const clave = input.value.trim();

    if (!clave) {
        Swal.fire({
            icon: 'warning',
            title: 'Campo vacío',
            text: 'Ingrese una clave de rastreo.'
        });
        return;
    }

    let solicitud = todasLasSolicitudes.find(s => s.clave_rastreo === clave);

    if (!solicitud) {
        try {
            const response = await fetch(`http://localhost:4000/api/solicitudes/seguimiento/${clave}`);
            if (response.ok) {
                solicitud = await response.json();
            }
        } catch (error) {
            console.error("❌ Error al buscar solicitud en el backend:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al consultar la solicitud. Intente nuevamente.'
            });
            return;
        }
    }

    if (solicitud) {
        verDetalles(clave);
    } else {
        Swal.fire({
            icon: 'error',
            title: 'No encontrada',
            text: 'No se encontró ninguna solicitud con esa clave de rastreo.'
        });
    }

    input.value = "";
}


function cerrarSesion() {
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("token");
    window.location.href = "login.html";
}

// Ejecutar al cargar la página
obtenerNombreUsuario();
cargarSolicitudes();
cargarTiposEquipo();

document.getElementById("btnBuscar").addEventListener("click", buscarSolicitud);

// Permitir buscar con Enter en el input
document.getElementById("buscarClave").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        buscarSolicitud();
    }
});