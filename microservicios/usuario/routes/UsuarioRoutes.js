/**
 * ===============================================================
 * Nombre del archivo : UsuarioRoutes.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Contiene los endpoints para los usuarios.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const verificarToken = require('../middlewares/authMiddleware'); 

// Endpoint: /api/usuarios/
router.get('/', UsuarioController.getAllUsuarios);
// Endpoint: /api/usuarios/login
router.post('/login', UsuarioController.loginUsuario);
// Endpoint: /api/usuarios/perfil
router.get('/perfil', verificarToken, UsuarioController.obtenerPerfil);

module.exports = router;