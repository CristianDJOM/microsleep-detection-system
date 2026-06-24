const indexCtrl = {};

indexCtrl.renderIndex = (req, res) => {
  res.render("index");
};

indexCtrl.renderPreguntas = (req, res) => {
  res.render("preguntas");
};

module.exports = indexCtrl;