const { Schema, model } = require("mongoose");

const MicrosuenosSchema = new Schema(
  {
    idusuario: { type: String },
    microsueno: { type: Number },
    duracion: {type: Number},
    fecha:{type: String},
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = model("Microsuenos", MicrosuenosSchema);