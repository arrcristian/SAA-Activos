const express = require('express');
<<<<<<< Updated upstream
const { crearNuevaSolicitud } = require('../controllers/solicitudController');
const router = express.Router();

router.post('/crear', crearNuevaSolicitud);
=======
const { crearNuevaSolicitud, obtenerSeguimiento, procesarRespuestaCorreo, actualizarEstado, cancelar } = require('../controllers/solicitudController');
const router = express.Router();

router.post('/crear', crearNuevaSolicitud);
router.post('/cambiar-estado/:clave_rastreo', actualizarEstado);
router.post('/cancelar/:clave_rastreo', cancelar);
router.get('/respuesta', procesarRespuestaCorreo);
router.get('/seguimiento/:clave_rastreo', obtenerSeguimiento);
>>>>>>> Stashed changes

module.exports = router;
