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
            const [rows] = await connection.execute('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error al obtener usuario por usuario:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async obtenerUsuarioPorCorreo(correo) {
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
    }

    async crearUsuario(usuario, correo, nombre, contrasena, tipo) {
        let connection;
        try {
            connection = await pool.getConnection();
            const hashedPass = await bcrypt.hash(contrasena, 10);
            const [result] = await connection.execute(
                'INSERT INTO usuarios (usuario, correo, nombre, contrasena, tipo) VALUES (?, ?, ?, ?, ?)',
                [usuario, correo, nombre, hashedPass, tipo]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async actualizarPassword(id, nuevaContrasena) {
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

    async eliminarUsuario(id) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.execute('DELETE FROM usuarios WHERE id = ?', [id]);
            return true;
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = new UsuarioRepository();
