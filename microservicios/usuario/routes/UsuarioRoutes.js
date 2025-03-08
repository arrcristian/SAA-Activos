const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

// Endpoints para usuarios
router.post('/crear', UsuarioController.createUsuario);
router.get('/', UsuarioController.getAllUsuarios);
router.post('/login', UsuarioController.loginUsuario);
router.get('/perfil', verificarToken, UsuarioController.obtenerPerfil);
router.post('/recuperar', UsuarioController.recuperarContrasena);




module.exports = router;