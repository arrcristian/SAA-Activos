async function consultarSeguimiento() {
    const trackingId = document.getElementById('tracking_id').value.trim();
    if (!trackingId) {
        alert('Por favor, ingrese una clave de rastreo.');
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
            alert(data.error);
        }
    } catch (error) {
        console.error('Error al consultar:', error);
        alert('Error al consultar el seguimiento.');
    }
}