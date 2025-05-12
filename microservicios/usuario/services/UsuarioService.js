const UsuarioRepository = require('../repositories/UsuarioRepository');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

async function verificarPassword(contrasenaIngresada, hashAlmacenado) {
    return await bcrypt.compare(contrasenaIngresada, hashAlmacenado);
}

class UsuarioService {

    async getAllUsuarios() {
        return await UsuarioRepository.obtenerTodosLosUsuarios();
    }

    async loginUsuario(usuario, contrasena) {   
        if (!usuario || !contrasena) {
            throw { status: 400, message: "Usuario y contraseña son requeridos" };
        }

        const usuarioDB = await UsuarioRepository.obtenerUsuarioPorUsuario(usuario);
        if (!usuarioDB) {
            throw { status: 401, message: "El usuario no existe" };
        }

        // Verificar la contraseña con bcrypt
        const passwordValido = await verificarPassword(contrasena, usuarioDB.contrasena);
        if (!passwordValido) {
            throw { status: 401, message: "Contraseña incorrecta" };
        }

        // Generar token
        const token = jwt.sign(
            { id: usuarioDB.id, usuario: usuarioDB.usuario },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );

        return { token, usuario: usuarioDB.usuario };
    }
    

    async recuperarContrasena(correo) {
        const usuario = await UsuarioRepository.obtenerUsuarioPorCorreo(correo);
        if (!usuario) {
            throw { status: 404, message: "No se encontró una cuenta con ese correo." };
        }

        // Generar una contraseña temporal
        const nuevaContrasena = crypto.randomBytes(4).toString('hex'); 

        // Guardar la nueva contraseña en la base de datos
        await UsuarioRepository.actualizarContrasena(usuario.id, nuevaContrasena);

        // Configurar el transporte de correo
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Enviar el correo con la nueva contraseña
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: correo,
            subject: "Recuperación de contraseña",
            text: `Tu nueva contraseña temporal es: ${nuevaContrasena}. Cámbiala lo antes posible.`
        };

        await transporter.sendMail(mailOptions);

        return { message: "Se ha enviado una nueva contraseña a tu correo." };
    }
}

module.exports = new UsuarioService();
