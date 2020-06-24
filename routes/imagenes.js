var express = require("express");
var app = express();
var fs = require("fs");
//Rutas
app.get("/:tipo/:img", (req, resp, next) => {
  var tipo = req.params.tipo;
  var img = req.params.img;

  var path = `./uploads/${tipo}/${img}`;
  fs.exists(path, (existe) => {
    if (!existe) {
      path = "./assets/no-image.png";
    }

    var root = __dirname.substring(0, __dirname.length - "routes".length);
    resp.sendFile(root + path);
  });
  //   res.status(200).json({
  //     ok: true,
  //     mensaje: "Petición realizada correctamente",
  //   });
});

module.exports = app;
