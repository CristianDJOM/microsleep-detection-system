const router = require("express").Router();

const {
  recibirmicrosueno,
  mostrarmicrosueno,
  borrar,
} = require("../controllers/microsuenos.controllers");

const { isAuthenticated } = require("../helpers/auth");


router.post("/Microsueno", recibirmicrosueno);
router.get("/microsuenos/:id", isAuthenticated,  mostrarmicrosueno);
router.get("/eliminar", borrar);

module.exports = router;