/**
 * ===============================================================
 * Nombre del archivo : UsuarioService.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Contiene la lógica para poder manejar las operaciones referentes a los usuarios.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const UsuarioRepository = require('../repositories/UsuarioRepository');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

/**
 * Método que se encarga de verificar que el password sea correcto.
 * @param {string} contrasenaIngresada - Password que se quiere verificar.
 * @param {string} hashAlmacenado - Hash que corresponde al password guardado.
 * @returns {boolean} True si las dos son iguales, False en caso contrario.
 */
async function verificarPassword(contrasenaIngresada, hashAlmacenado) {
    return await bcrypt.compare(contrasenaIngresada, hashAlmacenado);
}

/**
 * Clase que contiene los metodos necesarios para manejar la logica de los usuarios.
 */
class UsuarioService {

    /**
     * Método que obtiene todos los usuarios.
     * @returns {Array<<Object>>} Arreglo con todos los usuarios encontrados.
     */
    async getAllUsuarios() {
        return await UsuarioRepository.obtenerTodosLosUsuarios();
    }

    /**
     * Método que permite iniciar sesion a un usuario.
     * @param {string} usuario - Nombre de usuario.
     * @param {string} contrasena - Password del usuario.
     * @returns {Object} Objeto con el token generado para ese usuario.
     */
    async loginUsuario(usuario, contrasena) {   
        if (!usuario || !contrasena) {
            throw { status: 400, message: "Usuario y contraseña son requeridos" };
        }

        const usuarioDB = await UsuarioRepository.obtenerUsuarioPorUsuario(usuario);
        if (!usuarioDB) {
            throw { status: 401, message: "El usuario no existe" };
        }

        const passwordValido = await verificarPassword(contrasena, usuarioDB.contrasena);
        if (!passwordValido) {
            throw { status: 401, message: "Contraseña incorrecta" };
        }

        const token = jwt.sign(
            { id: usuarioDB.id, usuario: usuarioDB.usuario },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );

        return { token, usuario: usuarioDB.usuario };
    }
    
}

module.exports = new UsuarioService();
