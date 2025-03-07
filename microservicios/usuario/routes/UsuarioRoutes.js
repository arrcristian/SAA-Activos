const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

// Endpoints para usuarios
router.post('/crear', UsuarioController.createUsuario);
router.get('/', UsuarioController.getAllUsuarios);
router.post('/login', UsuarioController.loginUsuario);



module.exports = router;