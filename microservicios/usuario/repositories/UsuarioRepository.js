const db = require('../config/dbConfig');
const bcrypt = require('bcrypt');

class UsuarioRepository {

    // Obtener todos los usuarios
    async obtenerTodosLosUsuarios() {
        try {
            const [rows] = await db.execute('SELECT id, usuario FROM Usuario'); // Excluyendo contraseña por seguridad
            return rows;
        } catch (error) {
            console.error('Error al obtener todos los usuarios:', error);
            throw error;
        }
    }
    
    // Obtener usuario por nombre de usuario
    async obtenerUsuarioPorNombre(usuario) {
        try {
            const [rows] = await db.execute('SELECT * FROM Usuario WHERE usuario = ?', [usuario]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            throw error;
        }
    }

    // Obtener usuario por ID
    async obtenerUsuarioPorId(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM Usuario WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error al obtener usuario por ID:', error);
            throw error;
        }
    }

    // Crear nuevo usuario con contraseña encriptada
    async crearUsuario(usuario, pass) {
        try {
            const hashedPass = await bcrypt.hash(pass, 10);
            const [result] = await db.execute('INSERT INTO Usuario (usuario, pass) VALUES (?, ?)', [usuario, hashedPass]);
            return result.insertId;
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
    }

    // Actualizar contraseña de usuario
    async actualizarPassword(id, nuevaPass) {
        try {
            const hashedPass = await bcrypt.hash(nuevaPass, 10);
            await db.execute('UPDATE Usuario SET pass = ? WHERE id = ?', [hashedPass, id]);
            return true;
        } catch (error) {
            console.error('Error al actualizar contraseña:', error);
            throw error;
        }
    }

    // Eliminar usuario por ID
    async eliminarUsuario(id) {
        try {
            await db.execute('DELETE FROM Usuario WHERE id = ?', [id]);
            return true;
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    }
}

module.exports = new UsuarioRepository();
