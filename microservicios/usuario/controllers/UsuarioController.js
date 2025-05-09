const UsuarioService = require('../services/UsuarioService');

class UsuarioController {
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

    async getAllUsuarios(req, res) {
        res.json({ message: "Todos los usuarios" });
    }
}

module.exports = new UsuarioController();
