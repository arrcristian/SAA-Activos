const UsuarioService = require('../services/UsuarioService');

class UsuarioController {
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

    async recuperarContrasena(req, res) {
        try {
            const { correo } = req.body;
            const respuesta = await UsuarioService.recuperarContrasena(correo);
            res.status(200).json(respuesta);
        } catch (error) {
            console.error("Error en recuperación de contraseña:", error.message);
            res.status(error.status || 500).json({ message: error.message });
        }
    }

}

module.exports = new UsuarioController();
