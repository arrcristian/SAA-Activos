/**
 * ===============================================================
 * Nombre del archivo : inventarioService.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Establece métodos para interactuar con la base de datos de Access.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const getConnection = require('../config/dbConfig');

/**
 * Busca y obtiene la información requerida del equipo con el service tag indicado.
 * @param {string} serie - Service tag del equipo a buscar.
 * @returns {Promise<Array<Object>>} Resultado de la consulta, una lista de objetos con los datos del equipo.
 */
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
