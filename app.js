//Requires
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
//Inicializar variables
var app = express();

//body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Importar rutas
var appRoutes = require("./routes/rutas");
var usuarioRoutes = require("./routes/usuario");
var loginRoutes = require("./routes/login");
var hospitalRoutes = require("./routes/hospital");
var medicoRoutes = require("./routes/medico");
var busquedaRoutes = require("./routes/busqueda");
var uploadRoutes = require("./routes/upload");
var imagenesRoutes = require("./routes/imagenes");
//Server index config
var serveIndex = require("serve-index");
app.use(express.static(__dirname + "/"));
app.use("/uploads", serveIndex(__dirname + "/uploads"));

//Rutas
app.use("/usuario", usuarioRoutes);
app.use("/login", loginRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/medico", medicoRoutes);
app.use("/busqueda", busquedaRoutes);
app.use("/upload", uploadRoutes);
app.use("/img", imagenesRoutes);
app.use("/", appRoutes);
//Conexion bbdd
mongoose.connection.openUri(
  "mongodb://localhost:27017/hospitalDB",
  (err, resp) => {
    if (err) throw err;
    console.log("BBDD devuelve: \x1b[32m%s\x1b[0m", "200 OK");
  }
);

//Escuchar peticiones
app.listen(3000, () => {
  console.log("Respuesta del servidor: \x1b[32m%s\x1b[0m", "200 OK");
});
