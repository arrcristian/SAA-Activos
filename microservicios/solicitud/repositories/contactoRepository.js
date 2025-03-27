const pool = require('../config/db');

const obtenerCorreoSupervisor = async (departamento) => {
    try {
        const [rows] = await pool.query(`
            SELECT nombre, email FROM contactos WHERE puesto = 'Supervisor' AND departamento = ? LIMIT 1
        `, [departamento]);

        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("❌ Error al obtener correo del supervisor:", error);
        throw error;
    }
};

module.exports = { obtenerCorreoSupervisor };
