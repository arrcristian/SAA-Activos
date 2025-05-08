const express = require('express');
const router = express.Router();
const { obtenerEquipo } = require('../controllers/inventarioController');

// Endpoint: /api/inventario/:serie
router.get('/:serie', obtenerEquipo);

module.exports = router;
