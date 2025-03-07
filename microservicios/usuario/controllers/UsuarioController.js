const UsuarioService = require('../services/UsuarioService');

class UsuarioController {
    async createUsuario(req, res) {
        try {
            const usuario = await UsuarioService.createUsuario(req.body);
            res.status(201).json(usuario);
        } catch (error) {
            console.error("Error al crear usuario:", error.message);
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async getAllUsuarios(req, res) {
        try {
            const usuarios = await UsuarioService.getAllUsuarios();
            res.json(usuarios);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            res.status(500).json({ message: "Error al obtener usuarios." });
        }
    }

    async loginUsuario(req, res) {
        try {
            const { usuario, contrasena } = req.body;
            const resultado = await UsuarioService.loginUsuario(usuario, contrasena);
            res.json(resultado);
        } catch (error) {
            console.error("Error en login:", error.message);
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async obtenerPerfil(req, res) {
        try {
            res.status(200).json({ message: "Perfil válido", usuario: req.usuario });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener perfil" });
        }
    }
}

module.exports = new UsuarioController();
