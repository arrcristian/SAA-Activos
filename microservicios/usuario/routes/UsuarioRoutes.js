const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const verificarToken = require('../middlewares/authMiddleware'); 

// Endpoints para usuarios
router.get('/', UsuarioController.getAllUsuarios);
router.post('/login', UsuarioController.loginUsuario);
router.get('/perfil', verificarToken, UsuarioController.obtenerPerfil);




module.exports = router;