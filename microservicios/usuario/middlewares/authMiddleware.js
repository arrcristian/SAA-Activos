const jwt = require('jsonwebtoken');

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
