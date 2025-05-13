/**
 * ===============================================================
 * Nombre del archivo : authMiddleware.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Autenticador que se utiliza para mejorar la seguridad al momento de iniciar sesion.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware que verifica la validez del token JWT en la cabecera de autorización.
 * @param {import('express').Request} req - Objeto de solicitud HTTP que contiene el encabezado.
 * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa el resultado obtenido.
 * @param {import('express').NextFunction} next - Función para pasar al siguiente middleware.
 * @returns {void}
 */
function verificarToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
    }

    try {
        const tokenLimpio = token.replace("Bearer ", "");
        const decoded = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado. Por favor, inicie sesión nuevamente." });
        }
        return res.status(401).json({ message: "Token inválido." });

    }   
}

module.exports = verificarToken;
