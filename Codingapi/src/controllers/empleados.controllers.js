const empleadoCtrl = {};
const Empleado = require("../models/empleados");
const Microsueno = require("../models/microsunos");
const { uploadImageStaff, deleteImage } = require("../utils/cloudinary");
const fs = require("fs-extra");

empleadoCtrl.registarEmpleado = (req, res) => {
  const idgefe = req.params.id
  res.render("staff/register", {idgefe});
};

empleadoCtrl.mostrarEmpleados = async (req, res) => {
  const idgefe = req.params.id;
  const Empleados = await Empleado.find({idgefe}).lean();
  res.render("staff/empleados", { Empleados: Empleados });
};

empleadoCtrl.guardarEmpleado = async (req, res) => {
  let errors = [];
  const {
    idgefe,
    fullname,
    phone,
    department,
    municipality,
    neighborhood,
    address,
    Vehicle_plate,
    identificacion,
    email,
  } = req.body;
  if (!fullname) {
    errors.push({ text: "Por favor ingrese su nombre completo" });
  }
  if (!phone) {
    errors.push({ text: "Por favor ingrese su numero de telefono" });
  }
  if (!department) {
    errors.push({ text: "Por favor ingrese su departamento" });
  }
  if (!municipality) {
    errors.push({ text: "Por favor ingrese su municipio" });
  }
  if (!neighborhood) {
    errors.push({ text: "Por favor ingrese su barrio" });
  }
  if (!address) {
    errors.push({ text: "Por favor ingrese su direccion" });
  }
  if (!Vehicle_plate) {
    errors.push({ text: "Por favor ingrese la placa del vehiculo" });
  }
  if (!identificacion) {
    errors.push({ text: "Por favor ingrese su numero de documento" });
  }
  if (!email) {
    errors.push({ text: "Por favor ingrese un correo electronico" });
  }
  if (
    !req.files ||
    !req.files.imagen ||
    Object.keys(req.files.imagen).length === 0
  ) {
    errors.push({ text: "Ingrese una foto" });
  }
  if (errors.length > 0) {
    res.render("staff/register", {
      errors,
      fullname,
      phone,
      department,
      municipality,
      neighborhood,
      address,
      Vehicle_plate,
      identificacion,
      email,
    });
  } else {
    const emailUser = await Empleado.findOne({ email: email });
    if (emailUser) {
      req.flash("error_msg", "El mail ya está registrado");
      res.redirect("/registrar/empleado");
    } else {
      const newEmpleado = new Empleado({
        idgefe,
        fullname,
        phone,
        department,
        municipality,
        neighborhood,
        address,
        Vehicle_plate,
        identificacion,
        email,
      });
      if (req.files.imagen) {
        const result = await uploadImageStaff(req.files.imagen.tempFilePath);
        console.log(result);
        newEmpleado.image = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
        await fs.unlink(req.files.imagen.tempFilePath);
      }
      await newEmpleado.save();
      req.flash("success_msg", "Registro exitoso");
      res.redirect("back");
    }
  }
};

empleadoCtrl.editarEmpleado = async (req, res) => {
  const id = req.params.id;
  const empleado = await Empleado.findById(id).lean();
  res.render("staff/editstaff", { empleado: empleado });
};

empleadoCtrl.actualizarEmpleado = async (req, res) => {
  const id = req.params.id;
  const idgefe = req.body.idgefe;

  try {
    await Empleado.findByIdAndUpdate(
      id,
      {
        fullname: req.body.fullname,
        phone: req.body.phone,
        department: req.body.department,
        municipality: req.body.municipality,
        neighborhood: req.body.neighborhood,
        address: req.body.address,
        Vehicle_plate: req.body.Vehicle_plate,
        identificacion: req.body.identificacion,
        email: req.body.email,
      },
      (error, id) => {
        if (error) {
          console.log(error);
          req.flash("error_msg", "Error al editar empleado");
          res.redirect("/ruta_de_error"); // Redirigir a una ruta de error en caso de error
        } else {
          console.log("Empleado actualizado:", id);
          req.flash("success_msg", "Empleado editado correctamente");
          res.redirect(`/empleados/${idgefe}`); // Redirigir a la ruta con la ID del jefe de empleado
        }
      }
    );
  } catch (error) {
    console.log(error);
    req.flash("error_msg", "Error al editar empleado");
    res.redirect("/ruta_de_error"); // Redirigir a una ruta de error en caso de error
  }
};


empleadoCtrl.despedir = async (req, res) => {
  const { id } = req.params;
  const empleado = await Empleado.findByIdAndDelete(id);
  await deleteImage(empleado.image.public_id);
  await Microsueno.deleteMany({ idusuario: id });
  req.flash("success_msg", "Eliminado correctamente");
  res.redirect("back");
};

module.exports = empleadoCtrl;