class Usuario {
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