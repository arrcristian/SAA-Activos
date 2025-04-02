<<<<<<< Updated upstream
const express = require('express');
const { crearNuevaSolicitud, procesarRespuestaCorreo, actualizarEstado, cancelar } = require('../controllers/solicitudController');
=======
const express = require('express')
const { crearNuevaSolicitud, obtenerSeguimiento, obtenerSolicitudes, procesarRespuestaCorreo, actualizarEstado, cancelar } = require('../controllers/solicitudController');
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
const router = express.Router();

router.post('/crear', crearNuevaSolicitud);
router.post('/cambiar-estado/:clave_rastreo', actualizarEstado);
router.post('/cancelar/:clave_rastreo', cancelar);
router.get('/respuesta', procesarRespuestaCorreo);
<<<<<<< Updated upstream
=======
router.get('/seguimiento/:clave_rastreo', obtenerSeguimiento);
router.get('/obtener', obtenerSolicitudes);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

module.exports = router;
