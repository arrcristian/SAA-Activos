const UsuarioRepository = require('../repositories/UsuarioRepository');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class UsuarioService {
    async createUsuario({ usuario, correo, nombre, contrasena, tipo }) {
        if (!usuario || !correo || !nombre || !contrasena || !tipo) {
            throw { status: 400, message: "Todos los campos son requeridos" };
        }

        const usuarioExistente = await UsuarioRepository.obtenerUsuarioPorUsuario(usuario);
        if (usuarioExistente) {
            throw { status: 409, message: "El nombre de usuario ya está en uso" };
        }

        const correoExistente = await UsuarioRepository.obtenerUsuarioPorCorreo(correo);
        if (correoExistente) {
            throw { status: 409, message: "El correo ya está registrado" };
        }

        const userId = await UsuarioRepository.crearUsuario(usuario, correo, nombre, contrasena, tipo);
        return { id: userId, usuario, correo, nombre, tipo };
    }

    async getAllUsuarios() {
        return await UsuarioRepository.obtenerTodosLosUsuarios();
    }

    async loginUsuario(usuario, contrasena) {
        if (!usuario || !contrasena) {
            throw { status: 400, message: "Usuario y contraseña son requeridos" };
        }

        const usuarioDB = await UsuarioRepository.obtenerUsuarioPorUsuario(usuario);
        if (!usuarioDB) {
            throw { status: 401, message: "Credenciales incorrectas" };
        }

        const passwordValido = await bcrypt.compare(contrasena, usuarioDB.contrasena);
        if (!passwordValido) {
            throw { status: 401, message: "Credenciales incorrectas" };
        }

        const token = jwt.sign(
            { id: usuarioDB.id, usuario: usuarioDB.usuario, tipo: usuarioDB.tipo },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return { token, usuario: usuarioDB.usuario, tipo: usuarioDB.tipo };
    }
}

module.exports = new UsuarioService();

