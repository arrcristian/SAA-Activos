let estadoActualGlobal = ""; // Variable global

(async function validarToken() {
    const token = sessionStorage.getItem("token");
    if (!token || token.trim() === "") {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/api/usuarios/perfil", {
            headers: { "Authorization": `Bearer ${token}` }
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

const urlParams = new URLSearchParams(window.location.search);
const claveRastreo = urlParams.get('clave');
document.getElementById("clave_rastreo").textContent = claveRastreo;

async function cargarDetalles() {
    try {
        const response = await fetch(`http://localhost:4000/api/solicitudes/seguimiento/${claveRastreo}`);
        const solicitud = await response.json();

        if (!response.ok) throw new Error(solicitud.error || "Error al obtener la solicitud");

        document.getElementById("usuario").textContent = solicitud.usuario;
        document.getElementById("resolutor").textContent = solicitud.resolutor;
        document.getElementById("fecha_creacion").textContent = formatearFecha(solicitud.fecha_creacion);
        document.getElementById("tipo_equipo").textContent = solicitud.tipo_equipo || "No especificado";

        const historial = solicitud.historial;
        let estadoTexto = "Sin historial";
        if (historial && historial.length > 0) {
            const ultimaEtapa = historial[historial.length - 1];
            estadoTexto = ultimaEtapa.nombre_etapa || "Sin estado";
        }

        document.getElementById("estado").textContent = estadoTexto;
        const estadoNormalizado = estadoTexto.trim().toLowerCase();
        estadoActualGlobal = estadoNormalizado;

        if (["solicitud cancelada", "solicitud finalizada"].includes(estadoNormalizado)) {
            btnCambiarEstado.disabled = true;
            btnCancelar.disabled = true;
            btnCambiarEstado.style.backgroundColor = "#ccc";
            btnCancelar.style.backgroundColor = "#ccc";
            btnCambiarEstado.style.cursor = "not-allowed";
            btnCancelar.style.cursor = "not-allowed";
        }

        const historialContainer = document.getElementById("historial");
        historialContainer.innerHTML = "";
        solicitud.historial.forEach(entry => {
            const fechaFormateada = formatearFecha(entry.fecha_cambio);
            const row = document.createElement("tr");
            row.innerHTML = `<td>${entry.nombre_etapa}</td><td>${fechaFormateada}</td>`;
            historialContainer.appendChild(row);
        });
    } catch (error) {
        console.error("❌ Error al cargar detalles:", error);
    }
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return 'Fecha no disponible';
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = fecha.getFullYear();
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${año} | ${horas}:${minutos}`;
}

function cambiarEstado() {
    if (estadoActualGlobal === "preparación de equipo") {
        mostrarModalServiceTag();
    } else if (estadoActualGlobal === "documentación final") {
        verificarServiceTag();
    } else {
        enviarCambioEstado(null);
    }
}

function mostrarModalServiceTag() {
    const modal = document.getElementById("modalServiceTag");
    modal.style.display = "block";
}

function cerrarModalServiceTag() {
    const modal = document.getElementById("modalServiceTag");
    document.getElementById("inputServiceTagModal").value = "";
    modal.style.display = "none";
}

function cerrarModalDatosEquipo() {
    const modal = document.getElementById("modalDatosEquipo");
    modal.style.display = "none";
}

async function confirmarCambioFinal() {
    const btnAceptar = document.getElementById("btnAceptar");
    const btnCambiarEstado = document.getElementById("btnCambiarEstado");
    const btnCancelar = document.getElementById("btnCancelar");

    // Deshabilitar el botón "Aceptar" del modal
    btnAceptar.disabled = true;
    btnAceptar.textContent = "Procesando...";

    // Deshabilitar los botones principales
    btnCambiarEstado.disabled = true;
    btnCancelar.disabled = true;
    btnCambiarEstado.style.backgroundColor = "#ccc";
    btnCancelar.style.backgroundColor = "#ccc";
    btnCambiarEstado.style.cursor = "not-allowed";
    btnCancelar.style.cursor = "not-allowed";

    await finalizarSolicitud();

    cerrarModalDatosEquipo();

    // Si quieres que se puedan volver a usar, descomenta las siguientes líneas:
    // btnAceptar.disabled = false;
    // btnAceptar.textContent = "Aceptar";
}



function mostrarDatosEnModal(datos) {
    document.getElementById("campoFolio").textContent = datos.FolioImagen;
    document.getElementById("campoNumeroEmpleado").textContent = datos.NumeroEmpleado;
    document.getElementById("campoNombre").textContent = datos.NombreEmpleado;
    document.getElementById("campoPuesto").textContent = datos.PuestoEmpleado;
    document.getElementById("campoNombreEquipo").textContent = datos.NombreEquipo;
    document.getElementById("campoSucursal").textContent = datos.SucursalEmpleado;
    document.getElementById("campoCorreo").textContent = datos.CorreoEmpleado;

    document.getElementById("modalDatosEquipo").style.display = "block";
}

async function verificarServiceTag() {
    try {
        const response2 = await fetch(`http://localhost:4000/api/solicitudes/service-tag/${claveRastreo}`);
        const solicitud = await response2.json();

        if (!response2.ok) throw new Error(solicitud.error || "Error al obtener la solicitud");

        if (solicitud.service_tag != null) {
            try {
                const response = await fetch(`http://localhost:3002/api/inventario/${solicitud.service_tag}`);
                if (!response.ok) {
                    await Swal.fire({
                        icon: 'warning',
                        title: 'Service Tag no encontrado',
                        text: 'No se encontró el Service Tag en el inventario.'
                    });
                    return;
                }

                const datos = await response.json();
                // Mostrar los datos en un modal personalizado
                mostrarDatosEnModal(datos);

            } catch (error) {
                console.error("Error validando el Service Tag:", error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error de validación',
                    text: 'Ocurrió un error al validar el Service Tag.'
                });
            }
        }
    } catch (error) {
        console.error("Error al obtener la solicitud:", error);
        await Swal.fire({
            icon: 'error',
            title: 'Error de solicitud',
            text: error.message || 'No se pudo obtener la información del service tag.'
        });
    }
}


async function validarYEnviarServiceTag() {
    const serviceTag = document.getElementById("inputServiceTagModal").value.trim();
    
    if (!serviceTag) {
        Swal.fire({
            icon: 'warning',
            title: 'Campo vacío',
            text: 'Debe ingresar un Service Tag.'
        });
        return;
    }

    try {
        const response = await fetch(`http://localhost:3002/api/inventario/${serviceTag}`);
        
        if (!response.ok) {
            Swal.fire({
                icon: 'error',
                title: 'No encontrado',
                text: 'Service Tag no encontrado.'
            });
            return;
        }

        // Enviar cambio de estado con el service tag
        await enviarCambioEstado(serviceTag);

        // Mostrar alerta de éxito
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: `El Service Tag "${serviceTag}" fue procesado correctamente.`
        });

        cerrarModalServiceTag();
    } catch (error) {
        console.error("Error validando el Service Tag:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al validar el Service Tag.'
        });
    }
}


async function cancelarSolicitud() {
    try {
        const response = await fetch(`http://localhost:4000/api/solicitudes/cancelar/${claveRastreo}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error("Error al cancelar la solicitud");

        await Swal.fire({
            icon: 'success',
            title: 'Solicitud cancelada',
            text: 'La solicitud ha sido cancelada correctamente.'
        });

        cargarDetalles();
    } catch (error) {
        console.error("❌ Error al cancelar solicitud:", error);
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al cancelar la solicitud.'
        });
    }
}


async function finalizarSolicitud() {
    const correo = document.getElementById("campoCorreo").textContent;
    const imagen = document.getElementById("campoFolio").textContent;
    const nombre_empleado = document.getElementById("campoNombre").textContent;

    if (!correo || !imagen) {
        await Swal.fire({
            icon: 'warning',
            title: 'Datos incompletos',
            text: 'Faltan datos: correo o imagen.'
        });
        return;
    }

    try {
        const response = await fetch(`http://localhost:4000/api/solicitudes/finalizar-solicitud/${claveRastreo}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correoEmpleado: "kingue2811@gmail.com",
                imagen: imagen,
                nombre: nombre_empleado
            })
        });

        const data = await response.json();
        if (!response.ok) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.error || "Error al finalizar solicitud"
            });
            return;
        }

        await Swal.fire({
            icon: 'success',
            title: 'Solicitud finalizada',
            text: 'La solicitud ha sido finalizada y el correo ha sido enviado.'
        });

        cargarDetalles();
    } catch (error) {
        console.error("Error al finalizar solicitud:", error);
        await Swal.fire({
            icon: 'error',
            title: 'Error de red',
            text: 'Ocurrió un error de red al finalizar la solicitud.'
        });
    }
}


async function enviarCambioEstado(service_tag) {
    try {
        const response = await fetch(`http://localhost:4000/api/solicitudes/cambiar-estado/${claveRastreo}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ service_tag })
        });

        const data = await response.json();
        if (!response.ok) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.error || "Error al cambiar el estado"
            });
            return;
        }

        if (service_tag != null) {
            const response2 = await fetch(`http://localhost:4000/api/solicitudes/service-tag/${claveRastreo}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ service_tag })
            });

            const data2 = await response2.json();
            if (!response2.ok) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data2.error || "Error al registrar el Service Tag"
                });
                return;
            }

        } else {
            await Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: 'El estado de la solicitud se ha actualizado correctamente.'
            });
        }

        cargarDetalles(); // Refrescar página
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        await Swal.fire({
            icon: 'error',
            title: 'Error de red',
            text: 'Ocurrió un error de red al cambiar el estado.'
        });
    }
}

cargarDetalles();