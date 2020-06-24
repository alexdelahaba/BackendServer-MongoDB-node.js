var express = require("express");
var app = express();
var Usuario = require("../models/usuario");
var bcrypt = require("bcryptjs");
var mdAutenticacion = require("../middlewares/autenticacion");
const usuario = require("../models/usuario");
//Rutas

//========================
//Obtener todos
//========================
app.get("/", (req, resp, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  Usuario.find({}, "nombre email img role")
    .skip(desde)
    .limit(5)
    .exec((err, usuarios) => {
      if (err) {
        return resp.status(500).json({
          ok: false,
          mensaje: "Error en BBDD",
          errors: err,
        });
      }

      Usuario.count({}, (err, conteo) => {
        if (err) {
          return resp.status(500).json({
            ok: false,
            mensaje: "Error en contador de registros",
            errors: err,
          });
        }

        resp.status(200).json({
          ok: true,
          mensaje: "Todo ok Jose Luis",
          usuarios: usuarios,
          total: conteo,
        });
      });
    });
});

//========================
//Actualizar nuevo usuario
//========================

app.put("/:id", mdAutenticacion.verificaToken, (req, resp) => {
  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return resp.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario en BBDD",
        errors: err,
      });
    }

    if (!usuario) {
      return resp.status(400).json({
        ok: false,
        mensaje: "No hay un usuario con el id enviado: " + id,
        errors: { message: "No existe usuario con ese id" },
      });
    }
    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return resp.status(400).json({
          ok: false,
          mensaje: "Error al actualizar usuario",
          errors: err,
        });
      }
      resp.status(200).json({
        ok: true,
        usuario: usuarioGuardado,
      });
    });
  });
});
//========================
//Crear nuevo usuario
//========================
app.post("/", mdAutenticacion.verificaToken, (req, resp) => {
  var body = req.body;

  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role,
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return resp.status(400).json({
        ok: false,
        mensaje: "Error guardando en BBDD",
        errors: err,
      });
    }

    resp.status(200).json({
      ok: true,
      usuario: usuarioGuardado,
      usuarioToken: req.usuario,
    });
  });
});

//========================
//Borrar nuevo usuario
//========================
app.delete("/:id", mdAutenticacion.verificaToken, (req, resp) => {
  var id = req.params.id;
  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    if (err) {
      return resp.status(500).json({
        ok: false,
        mensaje: "Error al borrar usuario",
        errors: err,
      });
    }

    if (!usuarioBorrado) {
      return resp.status(400).json({
        ok: false,
        mensaje: "Error al borrar usuario",
        errors: { message: "No existe usuario con ese id" },
      });
    }

    resp.status(200).json({
      ok: true,
      usuario: usuarioBorrado,
    });
  });
});

module.exports = app;
