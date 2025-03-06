class Usuario {
    constructor(id, nombre, correo, contrasena, tipo) {
      this.id = id;
      this.nombre = nombre;
      this.correo = correo;
      this.contrasena = contrasena;
      this.tipo = tipo;
    }
  }
  
  module.exports = Usuario;