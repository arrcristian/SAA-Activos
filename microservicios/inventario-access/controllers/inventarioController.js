/**
 * ===============================================================
 * Nombre del archivo : inventarioController.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Establece métodos para manejar las peticiones relacionadas con la base de datos de Access.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const { buscarEquipoPorSerie } = require('../services/inventarioService');

/**
 * Obtiene los datos del equipo desde el inventario en la base de datos de Access.
 * @param {import('express').Request} req - Objeto de solicitud HTTP que contiene el service tag.
 * @param {import('express').Response} res - Objeto de respuesta HTTP que regresa el equipo obtenido.
 * @returns {Promise<void>} 
 */
async function obtenerEquipo(req, res) {
  const { serie } = req.params;

  try {
    const resultado = await buscarEquipoPorSerie(serie);

    if (resultado.length === 0) {
      return res.status(404).json({ mensaje: 'Equipo no encontrado' });
    }

    res.json(resultado[0]);
  } catch (error) {
    console.error('Error al consultar equipo:', error);
    res.status(500).json({ mensaje: 'Error al consultar el equipo' });
  }
}

module.exports = { obtenerEquipo };
