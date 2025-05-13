/**
 * ===============================================================
 * Nombre del archivo : authMiddleware.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Autenticador que se utiliza para mejorar la seguridad al momento de iniciar sesion.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

/**
 * Clase que modela al objeto usuario
 */
class Usuario {
  /**
   * Construtor que inicializa los valores de un objeto de tipo Usuario.
   * @param {int} id - Id del usuario.
   * @param {string} usuario - Nombre del usuario.
   * @param {string} nombre - Nombre de la persona.
   * @param {string} correo - Correo del usuario.
   * @param {string} contrasena - Password del usuario.
   * @param {string} tipo - Tipo de usuario.
   */
    constructor(id, usuario, nombre, correo, contrasena, tipo) {
      this.id = id;
      this.usuario = usuario;
      this.nombre = nombre;
      this.correo = correo;
      this.contrasena = contrasena;
      this.tipo = tipo;
    }
  }
  
  module.exports = Usuario;