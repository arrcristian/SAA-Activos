const UsuarioRepository = require('../repositories/UsuarioRepository');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class UsuarioService {
    // Crear un nuevo usuario
    async createUsuario({ usuario, pass }) {
        if (!usuario || !pass) {
            throw { status: 400, message: "Usuario y contraseña son requeridos" };
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await UsuarioRepository.obtenerUsuarioPorNombre(usuario);
        if (usuarioExistente) {
            throw { status: 409, message: "El usuario ya existe" };
        }

        // Crear usuario en la base de datos
        const userId = await UsuarioRepository.crearUsuario(usuario, pass);
        return { id: userId, usuario };
    }

    // Obtener todos los usuarios
    async getAllUsuarios() {
        return await UsuarioRepository.obtenerTodosLosUsuarios();
    }

    // Iniciar sesión
    async loginUsuario(usuario, pass) {
        if (!usuario || !pass) {
            throw { status: 400, message: "Usuario y contraseña son requeridos" };
        }

        // Buscar usuario en la BD
        const usuarioDB = await UsuarioRepository.obtenerUsuarioPorNombre(usuario);
        if (!usuarioDB) {
            throw { status: 401, message: "Credenciales incorrectas" };
        }

        // Verificar contraseña
        const passwordValido = await bcrypt.compare(pass, usuarioDB.pass);
        if (!passwordValido) {
            throw { status: 401, message: "Credenciales incorrectas" };
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: usuarioDB.id, usuario: usuarioDB.usuario },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return { token };
    }
}

module.exports = new UsuarioService();
