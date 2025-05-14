async function consultarSeguimiento() {
    const trackingId = document.getElementById('tracking_id').value.trim();

    if (!trackingId) {
        Swal.fire({
            icon: 'warning',
            title: 'Campo vacío',
            text: 'Por favor, ingrese una clave de rastreo.'
        });
        return;
    }

    try {
        const response = await fetch(`http://localhost:4000/api/solicitudes/seguimiento/${trackingId}`);
        const data = await response.json();

        if (response.ok) {
            // Redirigir a la página de detalles
            localStorage.setItem('seguimientoData', JSON.stringify(data));
            window.location.href = `seguimiento_detalles.html?clave=${trackingId}`;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'No encontrado',
                text: data.error || 'No se encontró la solicitud con esa clave.'
            });
        }
    } catch (error) {
        console.error('Error al consultar:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo consultar el seguimiento. Intente más tarde.'
        });
    }
}