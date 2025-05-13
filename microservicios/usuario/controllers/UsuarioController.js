/**
 * ===============================================================
 * Nombre del archivo : ticketRepository.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Maneja las peticiones relacionadas con la autenticación de resolutores de osticket.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const UsuarioService = require('../services/UsuarioService');

/**
 * Clase que posee los metodos necesarios para manejar las peticiones referentes a usuarios.
 */
class UsuarioController {
    /**
     * Método que se encarga de manejar la lógica de iniciar sesion.
     * @param {import('express').Request} req - Objeto de solicitud HTTP que posee el usuario y el password.
     * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa el resultado obtenido en formato JSON.
     */
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

    /**
     * Método que se encarga de obtener el perfil del usuario.
     * {import('express').Request} req - Objeto de solicitud HTTP.
     * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa el resultado obtenido en formato JSON.
     */
    async obtenerPerfil(req, res) {
        try {
            res.status(200).json({ message: "Perfil válido", usuario: req.usuario });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener perfil" });
        }
    }

    /**
     * Método que se encarga de obtener todos los usuarios registrados.
     * @param {import('express').Request} req - Objeto de solicitud HTTP.
     * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa el resultado obtenido en formato JSON.
     */
    async getAllUsuarios(req, res) {
        res.json({ message: "Todos los usuarios" });
    }
}

module.exports = new UsuarioController();
