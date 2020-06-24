var express = require("express");
var app = express();
var Usuario = require("../models/usuario");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var SEED = require("../config/config").SEED;

app.post("/", (req, resp) => {
  var body = req.body;
  Usuario.findOne({ email: body.email }, (err, usuarioEncontrado) => {
    if (err) {
      return resp.status(500).json({
        ok: false,
        mensaje: "Error en BBDD",
        errors: err,
      });
    }

    if (!usuarioEncontrado) {
      return resp.status(400).json({
        ok: false,
        mensaje: "No se ha encontrado un usuario con esos datos (email)",
        errors: err,
      });
    }

    if (!bcrypt.compareSync(body.password, usuarioEncontrado.password)) {
      return resp.status(400).json({
        ok: false,
        mensaje: "No se ha encontrado un usuario con esos datos (contraseña)",
        errors: err,
      });
    }

    //Creacion del jwt
    usuarioEncontrado.password = ":)";
    var token = jwt.sign({ usuario: usuarioEncontrado }, SEED, {
      expiresIn: 14400,
    });

    resp.status(200).json({
      ok: true,
      mensaje: "Todo ok Jose Luis",
      token: token,
      usuario: usuarioEncontrado,
      id: usuarioEncontrado.id,
    });
  });
});

module.exports = app;
