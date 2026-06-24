const MicrosuenoCtl = {}
const Empleado = require("../models/empleados");
const Microsueno = require("../models/microsunos");

// Función para obtener la fecha en formato "mes día año"
function obtenerFechaEnFormato() {
    const fechaactual = new Date(); // Obtener la fecha y hora actual
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const año = fechaactual.getFullYear();
    const mes = meses[fechaactual.getMonth()];
    const dia = fechaactual.getDate();
    return `${dia}/${mes}/${año}`;
}

MicrosuenoCtl.recibirmicrosueno = async (req, res) => {
    const dato = req.body;
    const microsueno  = dato.microsueno;
    const email = dato.email;
    //Buscar si el usuario esta registrado
    const UserRegistrado = await Empleado.findOne({ email }).lean();
    if (UserRegistrado) {
        const idusuario = UserRegistrado._id;
        const fecha = obtenerFechaEnFormato(); // Obtener la fecha actual en formato "mes día año"
        if(dato){
            const newMicrosueno = new Microsueno({
                idusuario,
                microsueno,
                fecha
            });
            await newMicrosueno.save();
            respuesta = {
                error: false,
                codigo: 200,
                mensaje: "Dato recibido",
            };
            res.send(respuesta);
        }else{
            respuesta = {
                error: true,
                codigo: 501,
                mensaje: "Error",
            };
            res.send(respuesta);
        }
            
    } else {
        console.log("No te encuentras registrado");
    }
};

MicrosuenoCtl.mostrarmicrosueno = async (req, res) => {
    const idusuario = req.params.id;
    try {
        const datosPorDia = await Microsueno.aggregate([
            {
                $match: { idusuario: idusuario } // Filtrar micro-sueños por el id del usuario
            },
            {
                $group: {
                    _id: "$fecha", // Agrupar por fecha
                    totalMicrosuenos: { $sum: 1 } // Sumar el número de micro-sueños por día
                }
            },
            { $sort: { _id: -1 } } // Ordenar por fecha ascendente
        ]);
        console.log("datos: ", datosPorDia);
        res.render("registroMicrosueno", { datosPorDia }); // Pasar los datos a la vista para mostrarlos
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener los datos de micro-sueños por día");
    }
};

MicrosuenoCtl.borrar = async (req, res) => {
    let fecha = "14/Mayo/2024"
    await Microsueno.deleteMany({fecha: fecha });
    res.status(200).json({ mensaje: `Se eliminaron` });
}

module.exports = MicrosuenoCtl;