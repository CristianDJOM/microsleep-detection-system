const { Schema, model } = require("mongoose");

const EmpleadoSchema = new Schema(
  {
    idgefe: { type: String, require: true },
    fullname: { type: String, require: true },
    phone: { type: Number, require: true },
    department:{type:String, require:true},
    municipality:{type:String, require:true},
    neighborhood:{type:String, require:true},
    address: { type: String, require: true },
    Vehicle_plate : { type: String, require: true },
    identificacion: { type: Number, require: true },
    email: { type: String, require: true, Unique: true },
    image: { public_id: String, secure_url: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = model("empleado", EmpleadoSchema);