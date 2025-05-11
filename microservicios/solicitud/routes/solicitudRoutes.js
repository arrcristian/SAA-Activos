const express = require('express')
const { finalizarSolicitud, actualizarServiceTagController, obtenerServiceTagController, crearNuevaSolicitud, obtenerSeguimiento, obtenerSolicitudes, procesarRespuestaCorreo, actualizarEstado, cancelar, getTiposEquipo } = require('../controllers/solicitudController');
const router = express.Router();

router.post('/crear', crearNuevaSolicitud);
router.post('/cambiar-estado/:clave_rastreo', actualizarEstado);
router.post('/cancelar/:clave_rastreo', cancelar);
router.get('/respuesta', procesarRespuestaCorreo);
router.get('/seguimiento/:clave_rastreo', obtenerSeguimiento);
router.get('/obtener', obtenerSolicitudes);
router.get('/tipos', getTiposEquipo);
router.put('/service-tag/:clave_rastreo', actualizarServiceTagController);
router.get('/service-tag/:clave_rastreo', obtenerServiceTagController);
router.post('/finalizar-solicitud/:clave_rastreo', finalizarSolicitud);

module.exports = router;
