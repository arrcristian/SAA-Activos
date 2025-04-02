const pool = require('../config/dbConfig');
const bcrypt = require('bcrypt');

class UsuarioRepository {
    async obtenerTodosLosUsuarios() {
        let connection;
        try {
            connection = await pool.getConnection();
            const [rows] = await connection.execute('SELECT id, usuario, correo, nombre, tipo FROM usuarios');
            return rows;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async obtenerUsuarioPorUsuario(usuario) {
        let connection;
        try {
            connection = await pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT staff_id AS id, username AS usuario, email AS correo, passwd AS contrasena
                 FROM ost_staff WHERE username = ?`, 
                [usuario]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error al obtener usuario de osTicket:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }


    /*async obtenerUsuarioPorCorreo(correo) {
        let connection;
        try {
            connection = await pool.getConnection();
            const [rows] = await connection.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error al obtener usuario por correo:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    } 

    async obtenerUsuarioPorId(id) {
        let connection;
        try {
            connection = await pool.getConnection();
            const [rows] = await connection.execute('SELECT * FROM usuarios WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error al obtener usuario por ID:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    } */
    async actualizarContrasena(id, nuevaContrasena) {
        let connection;
        try {
            connection = await pool.getConnection();
            const hashedPass = await bcrypt.hash(nuevaContrasena, 10);
            await connection.execute('UPDATE usuarios SET contrasena = ? WHERE id = ?', [hashedPass, id]);
            return true;
        } catch (error) {
            console.error('Error al actualizar contraseña:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    /*async aumentarIntentoFallido(id) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.execute(
                'UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1 WHERE id = ?',
                [id]
            );
        } catch (error) {
            console.error('Error al aumentar intentos fallidos:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }*/

    /*async bloquearUsuario(id) {
        let connection;
        try {
            connection = await pool.getConnection();
            const bloqueoHasta = new Date(Date.now() + 5 * 60 * 1000); // Bloquear por 5 minutos
            await connection.execute(
                'UPDATE usuarios SET bloqueado_hasta = ?, intentos_fallidos = 0 WHERE id = ?',
                [bloqueoHasta, id]
            );
        } catch (error) {
            console.error('Error al bloquear usuario:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    } */

    /*async resetearIntentosFallidos(id) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.execute('UPDATE usuarios SET intentos_fallidos = 0 WHERE id = ?', [id]);
        } catch (error) {
            console.error('Error al resetear intentos fallidos:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    } */
}

module.exports = new UsuarioRepository();
