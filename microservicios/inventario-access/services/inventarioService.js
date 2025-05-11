const getConnection = require('../config/dbconfig');

async function buscarEquipoPorSerie(serie) {
  const connection = await getConnection();
  try {
    // ⚠️ Escapamos comillas simples por seguridad básica
    const serieSegura = serie.replace(/'/g, "''");
    const query = `SELECT [Numero de Empleado] AS NumeroEmpleado,
                  [Nombre] AS NombreEmpleado,
                  [Nombre de Equipo] AS NombreEquipo,
                  [Sucursal] AS SucursalEmpleado,
                  [Correo] AS CorreoEmpleado,
                  [Folio] AS FolioImagen
                  FROM [Equipos de computo] 
                  WHERE [Service Tag] = '${serieSegura}'`;
    const result = await connection.query(query);
    return result;
  } finally {
    await connection.close();
  }
}

module.exports = { buscarEquipoPorSerie };
