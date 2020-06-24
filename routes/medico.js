var express = require("express");
var app = express();
var Medico = require("../models/medico");
var mdAutenticacion = require("../middlewares/autenticacion");

//Rutas

//=============================
//Obtener todos los medicos
//=============================
app.get("/", (req, resp, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  Medico.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .populate("hospital")
    .exec((err, medicos) => {
      if (err) {
        return resp.status(500).json({
          ok: false,
          mensaje: "Error en BBDD",
          errors: err,
        });
      }
      Medico.count({}, (err, conteo) => {
        resp.status(200).json({
          ok: true,
          mensaje: "Todo ok Jose Luis",
          medicos: medicos,
          total: conteo,
        });
      });
    });
});

//========================
//Actualizar medico
//========================
app.put("/:id", mdAutenticacion.verificaToken, (req, resp) => {
  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, (err, medico) => {
    if (err) {
      return resp.status(500).json({
        ok: false,
        mensaje: "Error al buscar medico en BBDD",
        errors: err,
      });
    }

    if (!medico) {
      return resp.status(400).json({
        ok: false,
        mensaje: "No hay un medico con el id enviado: " + id,
        errors: { message: "No existe medico con ese id" },
      });
    }
    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    medico.save((err, medicoGuardado) => {
      if (err) {
        return resp.status(400).json({
          ok: false,
          mensaje: "Error al actualizar medico",
          errors: err,
        });
      }
      resp.status(200).json({
        ok: true,
        medico: medicoGuardado,
      });
    });
  });
});
//========================
//Crear nuevo medico
//========================
app.post("/", mdAutenticacion.verificaToken, (req, resp) => {
  var body = req.body;

  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital,
  });

  medico.save((err, medicoGuardado) => {
    if (err) {
      return resp.status(400).json({
        ok: false,
        mensaje: "Error guardando en BBDD",
        errors: err,
      });
    }

    resp.status(200).json({
      ok: true,
      medico: medicoGuardado,
    });
  });
});

//========================
//Borrar medico
//========================
app.delete("/:id", mdAutenticacion.verificaToken, (req, resp) => {
  var id = req.params.id;
  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    if (err) {
      return resp.status(500).json({
        ok: false,
        mensaje: "Error al borrar medico",
        errors: err,
      });
    }

    if (!medicoBorrado) {
      return resp.status(400).json({
        ok: false,
        mensaje: "Error al borrar medico",
        errors: { message: "No existe medico con ese id" },
      });
    }

    resp.status(200).json({
      ok: true,
      medico: medicoBorrado,
    });
  });
});

module.exports = app;
