/**
 * ===============================================================
 * Nombre del archivo : inventarioRoutes.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Establece los endpoints relacionados con la base de datos de Access.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const express = require('express');
const router = express.Router();
const { obtenerEquipo } = require('../controllers/inventarioController');

// Endpoint: /api/inventario/:serie
router.get('/:serie', obtenerEquipo);

module.exports = router;
