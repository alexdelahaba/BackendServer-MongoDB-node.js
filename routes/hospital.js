var express = require("express");
var app = express();
var Hospital = require("../models/hospital");
var mdAutenticacion = require("../middlewares/autenticacion");

//Rutas

//=============================
//Obtener todos los hospitales
//=============================
app.get("/", (req, resp, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .exec((err, hospitales) => {
      if (err) {
        return resp.status(500).json({
          ok: false,
          mensaje: "Error en BBDD",
          errors: err,
        });
      }
      Hospital.count({}, (err, conteo) => {
        resp.status(200).json({
          ok: true,
          mensaje: "Todo ok Jose Luis",
          hospitales: hospitales,
          total: conteo,
        });
      });
    });
});

//========================
//Actualizar hospital
//========================
app.put("/:id", mdAutenticacion.verificaToken, (req, resp) => {
  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return resp.status(500).json({
        ok: false,
        mensaje: "Error al buscar hospital en BBDD",
        errors: err,
      });
    }

    if (!hospital) {
      return resp.status(400).json({
        ok: false,
        mensaje: "No hay un hospital con el id enviado: " + id,
        errors: { message: "No existe hospital con ese id" },
      });
    }
    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return resp.status(400).json({
          ok: false,
          mensaje: "Error al actualizar hospital",
          errors: err,
        });
      }
      resp.status(200).json({
        ok: true,
        hospital: hospitalGuardado,
      });
    });
  });
});
//========================
//Crear nuevo hospital
//========================
app.post("/", mdAutenticacion.verificaToken, (req, resp) => {
  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id,
  });

  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return resp.status(400).json({
        ok: false,
        mensaje: "Error guardando en BBDD",
        errors: err,
      });
    }

    resp.status(200).json({
      ok: true,
      hospital: hospitalGuardado,
    });
  });
});

//========================
//Borrar hospital
//========================
app.delete("/:id", mdAutenticacion.verificaToken, (req, resp) => {
  var id = req.params.id;
  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    if (err) {
      return resp.status(500).json({
        ok: false,
        mensaje: "Error al borrar hospital",
        errors: err,
      });
    }

    if (!hospitalBorrado) {
      return resp.status(400).json({
        ok: false,
        mensaje: "Error al borrar hospital",
        errors: { message: "No existe hospital con ese id" },
      });
    }

    resp.status(200).json({
      ok: true,
      hospital: hospitalBorrado,
    });
  });
});

module.exports = app;
