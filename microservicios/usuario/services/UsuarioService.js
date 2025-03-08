const UsuarioRepository = require('../repositories/UsuarioRepository');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

class UsuarioService {
    async createUsuario({ usuario, correo, nombre, contrasena, tipo }) {
        if (!usuario || !correo || !nombre || !contrasena || !tipo) {
            throw { status: 400, message: "Todos los campos son requeridos" };
        }

        // Validar usuario (5-20 caracteres alfanuméricos)
        const usuarioRegex = /^[a-zA-Z0-9]{5,20}$/;
        if (!usuarioRegex.test(usuario)) {
            throw { status: 400, message: "El nombre de usuario debe tener entre 5 y 20 caracteres alfanuméricos" };
        }

        // Validar contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#!_])[A-Za-z\d@#!_]{8,15}$/;
        if (!passwordRegex.test(contrasena)) {
            throw { status: 400, message: "La contraseña debe tener entre 8 y 15 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@, #, !, _)." };
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
            throw { status: 401, message: "El usuario no existe" };
        }
    
        // Verificar si el usuario está bloqueado
        if (usuarioDB.bloqueado_hasta && new Date(usuarioDB.bloqueado_hasta) > new Date()) {
            throw { status: 403, message: "Cuenta bloqueada. Intenta más tarde." };
        }
    
        const passwordValido = await bcrypt.compare(contrasena, usuarioDB.contrasena);
        if (!passwordValido) {
            await UsuarioRepository.aumentarIntentoFallido(usuarioDB.id);
    
            // Bloquear cuenta si se llega a 3 intentos fallidos
            if (usuarioDB.intentos_fallidos + 1 >= 3) {
                await UsuarioRepository.bloquearUsuario(usuarioDB.id);
                throw { status: 403, message: "Cuenta bloqueada por 5 minutos." };
            }
    
            throw { status: 401, message: "Contraseña incorrecta" };
        }
    
        // Si inicia sesión correctamente, resetear intentos fallidos
        await UsuarioRepository.resetearIntentosFallidos(usuarioDB.id);
    
        const token = jwt.sign(
            { id: usuarioDB.id, usuario: usuarioDB.usuario, tipo: usuarioDB.tipo },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
    
        return { token, usuario: usuarioDB.usuario, tipo: usuarioDB.tipo };
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

