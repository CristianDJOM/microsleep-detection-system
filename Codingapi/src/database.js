const mongoose = require("mongoose");

const MONGODB_URI = "link";
//esto lo toman de la pagina de mongodb

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((db) => console.log("DB is connected"))
  .catch((err) => console.error(err));