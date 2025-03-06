const express = require('express');
const { crearNuevaSolicitud } = require('../controllers/solicitudController');
const router = express.Router();

router.post('/crear', crearNuevaSolicitud);

module.exports = router;
