const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const UsuariosSchema = new Schema(
  {
    fullname: { type: String, require: true },
    phone: { type: Number, require: true },
    company:{type:String, require:true},
    identificacion: { type: Number, require: true },
    email: { type: String, require: true, Unique: true },
    password: { type: String, require: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UsuariosSchema.methods.encryptPassword = async password => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
  
UsuariosSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = model("usuario", UsuariosSchema);