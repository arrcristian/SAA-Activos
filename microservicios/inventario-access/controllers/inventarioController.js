const { buscarEquipoPorSerie } = require('../services/inventarioService');

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
