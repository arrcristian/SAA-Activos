const express = require('express')
const { crearNuevaSolicitud, obtenerSeguimiento, obtenerSolicitudes, procesarRespuestaCorreo, actualizarEstado, cancelar } = require('../controllers/solicitudController');
const router = express.Router();

router.post('/crear', crearNuevaSolicitud);
router.post('/cambiar-estado/:clave_rastreo', actualizarEstado);
router.post('/cancelar/:clave_rastreo', cancelar);
router.get('/respuesta', procesarRespuestaCorreo);
router.get('/seguimiento/:clave_rastreo', obtenerSeguimiento);
router.get('/obtener', obtenerSolicitudes);


module.exports = router;
