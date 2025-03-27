const express = require('express');
const { crearNuevaSolicitud, procesarRespuestaCorreo, actualizarEstado, cancelar } = require('../controllers/solicitudController');
const router = express.Router();

router.post('/crear', crearNuevaSolicitud);
router.post('/cambiar-estado/:clave_rastreo', actualizarEstado);
router.post('/cancelar/:clave_rastreo', cancelar);
router.get('/respuesta', procesarRespuestaCorreo);

module.exports = router;
