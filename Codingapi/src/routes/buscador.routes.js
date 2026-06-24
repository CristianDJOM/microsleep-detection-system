const express = require("express");
const router = express.Router();

const {
    mostrar,
    buscar,
} = require("../controllers/buscador.controllers");

router.post("/buscar", buscar);
//router.get("/mostar/busqueda", mostrar);

module.exports = router;