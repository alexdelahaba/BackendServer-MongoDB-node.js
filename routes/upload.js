var express = require("express");
var fileUpload = require("express-fileupload");
var app = express();
var fs = require("fs");
var Usuario = require("../models/usuario");
var Medico = require("../models/medico");
var Hospital = require("../models/hospital");

app.use(fileUpload());

app.put("/:tipo/:id", (req, resp, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  //tipos de coleccion
  var tiposValidos = ["hospitales", "usuarios", "medicos"];

  if (tiposValidos.indexOf(tipo) < 0) {
    return resp.status(400).json({
      ok: false,
      mensaje: "Tipo de coleccion no válida",
      errors: { message: "Debe seleccionar un tipo de coleccion valida" },
    });
  }

  if (!req.files) {
    return resp.status(500).json({
      ok: false,
      mensaje: "Error al subir archivo",
      errors: { message: "Debe seleccionar una imagen" },
    });
  }
  //obtener nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split(".");
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];

  //Extensiones acpetadas
  var extensionesValidas = ["png", "jpg", "gif", "jpeg"];

  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return resp.status(500).json({
      ok: false,
      mensaje: "Extensión no válida",
      errors: {
        message: "La extension debe ser de" + extensionesValidas.join(", "),
      },
    });
  }

  //Nombre de archivo personalizado para no crear conflictos
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  //Mover el archivo del temporal a un path
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, (err) => {
    if (err) {
      return resp.status(500).json({
        ok: false,
        mensaje: "Error al mover archivo",
        errors: err,
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, resp);
    // resp.status(200).json({
    //   ok: true,
    //   mensaje: "Archivo movido",
    //   extensionArchivo,
    // });
  });
});

function subirPorTipo(tipo, id, nombreArchivo, resp) {
  if (tipo === "usuarios") {
    Usuario.findById(id, (err, usuario) => {
      if (!usuario) {
        return resp.status(400).json({
          ok: false,
          mensaje: "usuario no encontrado",
          errors: { message: "usuario no existe" },
        });
      }
      var pathViejo = "./uploads/usuarios/" + usuario.img;

      //si existe una imagen previa, la elimina
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, () => {
          console.log("Archivo eliminado");
        });
      }

      usuario.img = nombreArchivo;
      usuario.password = ":)";

      usuario.save((err, usuarioActualizado) => {
        return resp.status(200).json({
          ok: true,
          mensaje: "Imagen actualizada",
          usuarioActualizado,
        });
      });
    });
  }
  if (tipo === "medicos") {
    Medico.findById(id, (err, medico) => {
      if (!medico) {
        return resp.status(400).json({
          ok: false,
          mensaje: "medico no encontrado",
          errors: { message: "medico no existe" },
        });
      }
      var pathViejo = "./uploads/medicos/" + medico.img;

      //si existe una imagen previa, la elimina
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, () => {
          console.log("Archivo eliminado");
        });
      }

      medico.img = nombreArchivo;

      medico.save((err, medicoActualizado) => {
        return resp.status(200).json({
          ok: true,
          mensaje: "Imagen actualizada",
          medicoActualizado,
        });
      });
    });
  }
  if (tipo === "hospitales") {
    Hospital.findById(id, (err, hospital) => {
      if (!hospital) {
        return resp.status(400).json({
          ok: false,
          mensaje: "hospital no encontrado",
          errors: { message: "hospital no existe" },
        });
      }
      var pathViejo = "./uploads/hospitals/" + hospital.img;

      //si existe una imagen previa, la elimina
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, () => {
          console.log("Archivo eliminado");
        });
      }

      hospital.img = nombreArchivo;

      hospital.save((err, hospitalActualizado) => {
        return resp.status(200).json({
          ok: true,
          mensaje: "Imagen actualizada",
          hospitalActualizado,
        });
      });
    });
  }
}

module.exports = app;
