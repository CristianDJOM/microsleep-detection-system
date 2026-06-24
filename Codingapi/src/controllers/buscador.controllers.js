const buscarCtrl = {};
const Empleado = require("../models/empleados");

buscarCtrl.buscar = async (req, res) => {
  const  busqueda  = req.body;
  const idgefe = busqueda.idgefe;
  const identificacion = busqueda.Identificacion;
  
  try {
    const resultadosEmpleados = await Empleado.findOne({ $and:[{identificacion, idgefe}] }).lean()
    return res.render("principal/buscador", {
      resultadosEmpleados: resultadosEmpleados
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = buscarCtrl;