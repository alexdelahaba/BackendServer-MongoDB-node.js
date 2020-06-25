var express = require("express");
var app = express();
var Usuario = require("../models/usuario");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var SEED = require("../config/config").SEED;

const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID = require("../config/config").GOOGLE_CLIENT_ID;
const GOOGLE_SECRET_ID = require("../config/config").GOOGLE_SECRET_ID;
//==================================
//Autenticacion de Google
//==================================
app.post("/google", (req, resp) => {
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET_ID, "");
  var token = req.body.token || "XXX";

  client.verifyIdToken(
    { idToken: token, audience: GOOGLE_CLIENT_ID },
    (err, login) => {
      if (err) {
        return resp.status(400).json({
          ok: false,
          mensaje: "Algo ha fallado, token no válido",
          errors: err,
        });
      }
      const payload = login.getPayload();
      const userid = payload["sub"];

      Usuario.findOne({ email: payload.email }, (err, usuario) => {
        if (err) {
          return resp.status(500).json({
            ok: false,
            mensaje: "Algo ha fallado, no se ha encontrado usuario",
            errors: err,
          });
        }
        if (usuario) {
          if (!usuario.google) {
            return resp.status(400).json({
              ok: false,
              mensaje: "Método de login incorrecto",
              errors: err,
            });
          } else {
            usuario.password = ":)";

            var token = jwt.sign({ usuario: usuario }, SEED, {
              expiresIn: 14400,
            });

            resp.status(200).json({
              ok: true,
              mensaje: "Todo ok Jose Luis",
              token: token,
              usuario: usuario,
              id: usuario.id,
            });
          }
        } else {
          var usuario = new Usuario();
          usuario.nombre = payload.name;
          usuario.email = payload.email;
          //cuidado con esto de abajo
          usuario.password = ":)";
          usuario.img = payload.picture;
          usuario.google = true;

          usuario.save((err, usuario) => {
            if (err) {
              return resp.status(400).json({
                ok: false,
                mensaje: "Algo ha fallado",
                errors: err,
              });
            }

            var token = jwt.sign({ usuario: usuario }, SEED, {
              expiresIn: 14400,
            });

            resp.status(200).json({
              ok: true,
              mensaje: "Todo ok Jose Luis",
              token: token,
              usuario: usuario,
              id: usuario.id,
            });
          });
        }
      });
    }
  );
});

//==================================
//Autnticación normal
//==================================
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
