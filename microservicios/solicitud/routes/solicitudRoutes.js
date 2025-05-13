/**
 * ===============================================================
 * Nombre del archivo : solicitudRoutes.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Establece los endpoints relacionados con las operaciones sobre las solicitudes.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const express = require('express')
const { finalizarSolicitud, actualizarServiceTagController, obtenerServiceTagController, crearNuevaSolicitud, obtenerSeguimiento, obtenerSolicitudes, procesarRespuestaCorreo, actualizarEstado, cancelar, getTiposEquipo } = require('../controllers/solicitudController');
const router = express.Router();

// Endpoint: /api/solicitudes/crear
router.post('/crear', crearNuevaSolicitud);
// Endpoint: /api/solicitudes/cambiar-estado/:clave_rastreo
router.post('/cambiar-estado/:clave_rastreo', actualizarEstado);
// Endpoint: /api/solicitudes/cancelar/:clave_rastreo
router.post('/cancelar/:clave_rastreo', cancelar);
// Endpoint: /api/solicitudes/respuesta
router.get('/respuesta', procesarRespuestaCorreo);
// Endpoint: /api/solicitudes/seguimiento/:clave_rastreo
router.get('/seguimiento/:clave_rastreo', obtenerSeguimiento);
// Endpoint: /api/solicitudes/obtener
router.get('/obtener', obtenerSolicitudes);
// Endpoint: /api/solicitudes/tipos
router.get('/tipos', getTiposEquipo);
// Endpoint: /api/solicitudes/service-tag/:clave_rastreo
router.put('/service-tag/:clave_rastreo', actualizarServiceTagController);
// Endpoint: /api/solicitudes/service-tag/:clave_rastreo
router.get('/service-tag/:clave_rastreo', obtenerServiceTagController);
// Endpoint: /api/solicitudes/finalizar-solicitud/:clave_rastreo
router.post('/finalizar-solicitud/:clave_rastreo', finalizarSolicitud);

module.exports = router;
