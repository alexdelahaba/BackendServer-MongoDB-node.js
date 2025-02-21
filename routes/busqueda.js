var express = require("express");
var app = express();

var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");
//==================================
//Búsqueda general
//==================================
app.get("/todo/:busqueda", (req, resp, next) => {
  var busqueda = req.params.busqueda;
  var regex = new RegExp(busqueda, "i");
  Promise.all([
    buscarHospitales(busqueda, regex),
    buscarMedicos(busqueda, regex),
    buscarUsuarios(busqueda, regex),
  ]).then((respuestas) => {
    resp.status(200).json({
      ok: true,
      hospitales: respuestas[0],
      medicos: respuestas[1],
      usuario: respuestas[2],
    });
  });
  buscarHospitales(busqueda, regex).then((hospitales) => {});
});

//==================================
//Búsqueda por coleccion
//==================================
app.get("/coleccion/:tabla/:busqueda", (req, resp) => {
  var busqueda = req.params.busqueda;
  var tabla = req.params.tabla;
  var promesa;
  var regex = new RegExp(busqueda, "i");

  switch (tabla) {
    case "usuarios":
      promesa = buscarUsuarios(busqueda, regex);
      break;
    case "medicos":
      promesa = buscarMedicos(busqueda, regex);
      break;
    case "hospitales":
      promesa = buscarHospitales(busqueda, regex);
      break;

    default:
      return resp.status(400).json({
        ok: false,
        mensaje: "No se han encontrado datos",
        error: { message: "Tabla no válida" },
      });
  }

  promesa.then((data) => {
    resp.status(200).json({
      ok: true,
      [tabla]: data,
    });
  });
});

//==================================
//Funciones de búsqueda
//==================================
function buscarHospitales(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex })
      .populate("usuario", "nombre email")
      .exec((err, hospitales) => {
        if (err) {
          reject("Error al cargar hospitales", err);
        } else {
          resolve(hospitales);
        }
      });
  });
}
function buscarMedicos(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex })
      .populate("usuario", "nombre email")
      .populate("hospital")
      .exec((err, medicos) => {
        if (err) {
          reject("Error al cargar medicos", err);
        } else {
          resolve(medicos);
        }
      });
  });
}
function buscarUsuarios(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, "nombre email role")
      .or([{ nombre: regex }, { email: regex }])
      .exec((err, usuarios) => {
        if (err) {
          reject("Error al cargar usuarios", err);
        } else {
          resolve(usuarios);
        }
      });
  });
}

module.exports = app;
