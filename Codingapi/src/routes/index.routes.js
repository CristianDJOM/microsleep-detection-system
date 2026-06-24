const express = require("express");
const router = express.Router();

const { renderIndex, renderPreguntas} = require("../controllers/index.controller");

router.get("/", renderIndex);
router.get("/preguntas", renderPreguntas);

module.exports = router;