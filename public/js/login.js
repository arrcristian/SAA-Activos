document.addEventListener("DOMContentLoaded", async function () {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch("http://localhost:4000/api/usuarios/perfil", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            // Token válido, redirigir
            window.location.href = "inicio.html";
        } else {
            // Token inválido o expirado, limpiar sesión
            sessionStorage.clear();
        }
    } catch (error) {
        sessionStorage.clear();
    }
});

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Evita el envío del formulario por defecto

    const usuario = document.getElementById("usuario").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();
    const mensaje = document.getElementById("mensaje");

    mensaje.textContent = ""; // Limpia mensajes anteriores

    if (!usuario || !contrasena) {
        mensaje.textContent = "Por favor, completa todos los campos.";
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/api/usuarios/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ usuario, contrasena })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error al iniciar sesión");
        }

        // Guardar el token en sessionStorage
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("usuario", data.usuario);

        alert("Inicio de sesión exitoso");

        // Redirigir al usuario a la página de inicio
        window.location.href = "inicio.html";

    } catch (error) {
        mensaje.textContent = error.message;
    }
});