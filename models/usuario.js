var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

var Schema = mongoose.Schema;

var roleValidos = {
  values: ["ADMIN_ROLE", "USER_ROLE"],
  message: "{VALUE} no es un rol permitido",
};

var usuarioSchema = new Schema({
  nombre: { type: String, required: [true, "El nombre es obligatorio"] },
  email: {
    type: String,
    unique: true,
    required: [true, "El email es obligatorio"],
  },
  password: { type: String, required: [true, "La contraseña es obligatoria"] },
  img: { type: String },
  role: {
    type: String,
    required: true,
    default: "USER_ROLE",
    enum: roleValidos,
  },
  google: { type: Boolean, required: true, default: false },
});

usuarioSchema.plugin(uniqueValidator, { message: "{PATH} debe ser único" });

module.exports = mongoose.model("Usuario", usuarioSchema);
