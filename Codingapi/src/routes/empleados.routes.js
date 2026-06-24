const router = require("express").Router();

const {
  registarEmpleado,
  guardarEmpleado,
  editarEmpleado,
  actualizarEmpleado,
  mostrarEmpleados,
  despedir,
} = require("../controllers/empleados.controllers");

const { isAuthenticated } = require("../helpers/auth");

router.get("/registrar/empleado/:id", isAuthenticated, registarEmpleado);
router.post("/guardar/empleado", isAuthenticated, guardarEmpleado);
router.get("/empleados/:id", isAuthenticated,  mostrarEmpleados);
router.get("/editar/empleado/:id", isAuthenticated, editarEmpleado)
router.post("/actualizar/empleado/:id", isAuthenticated, actualizarEmpleado);
router.get("/despedir/:id", isAuthenticated, despedir);

module.exports = router;