const getConnection = require('../config/dbconfig');

async function buscarEquipoPorSerie(serie) {
  const connection = await getConnection();
  try {
    // ⚠️ Escapamos comillas simples por seguridad básica
    const serieSegura = serie.replace(/'/g, "''");
    const query = `SELECT * FROM [Equipos de computo] WHERE [Service Tag] = '${serieSegura}'`;
    const result = await connection.query(query);
    return result;
  } finally {
    await connection.close();
  }
}

module.exports = { buscarEquipoPorSerie };
