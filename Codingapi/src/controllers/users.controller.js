const usersCtrl = {};
const { arrayStrictEqual } = require("mongodb/lib/core/utils");
const User = require("../models/User");
const passport = require("passport");

//-------------Usuarios-----------------------//
usersCtrl.renderSignUpForm = (req, res) => {
  res.render("users/signup");
};

usersCtrl.editado = (req, res) => {
  res.render("users/perfil");
};

usersCtrl.mostrarperfil = async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  res.render("users/perfil");
};

usersCtrl.editarUsuario = async (req, res) => {
  const usuario = await User.findById(req.params.id).lean();
  res.render("users/editarusuario",);
};

usersCtrl.guardarUsuario = async (req, res) => {
  const idUsuario = req.params.id;
  await User.findByIdAndUpdate(
    idUsuario,
    {
      fullname: req.body.fullname,
      phone: req.body.phone,
      company: req.body.company,
      identificacion: req.body.identificacion,
      email: req.body.email,
    },
    (error, idUsuario) => {
      console.log(error, idUsuario);
      res.redirect("/editado");
    }
  );
};

usersCtrl.singup = async (req, res) => {
  let errors = [];
  const {
    fullname,
    phone,
    company,
    identificacion,
    email,
    password,
    confirm_password,
  } = req.body;
  if (!fullname) {
    errors.push({ text: "Por favor ingrese su nombre completo" });
  }
  if (!phone) {
    errors.push({ text: "Por favor ingrese su numero de telefono" });
  }
  if (!company) {
    errors.push({ text: "Por favor ingrese el nombre de su empresa" });
  }
  if (!identificacion) {
    errors.push({ text: "Por favor ingrese su numero de documento" });
  }
  if (!email) {
    errors.push({ text: "Por favor ingrese un correo electronico" });
  }
  if (!password) {
    errors.push({ text: "Por favor ingrese una contraseña" });
  }
  if (password != confirm_password) {
    errors.push({ text: "Password no coinciden." });
  }
  if (password.length < 6) {
    errors.push({ text: "Passwords debe tener al menos 6 caracteres" });
  }
  if (errors.length > 0) {
    res.render("users/signup", {
      errors,
      fullname,
      phone,
      company,
      identificacion,
      email,
      password,
      confirm_password,
    });
  } else {
    const emailUser = await User.findOne({ email: email });
    if (emailUser) {
      req.flash("error_msg", "El mail ya está registrado");
      res.redirect("/users/signup");
    } else {
      const newUser = new User({
        fullname,
        phone,
        company,
        identificacion,
        email,
        password,
      });
      newUser.password = await newUser.encryptPassword(password);
      await newUser.save();
      req.flash("success_msg", "Registro exitoso");
      res.redirect("/users/signin");
    }
  }
};

usersCtrl.renderSigninForm = (req, res) => {
  res.render("users/signin");
};

usersCtrl.signin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("error_msg", "Email o Password incorrecto");
      return res.redirect("/users/signin");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      const redirectTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      return res.redirect(redirectTo);
    });
  })(req, res, next);
};

usersCtrl.logout = (req, res) => {
  req.logout();
  res.redirect("/");
};

module.exports = usersCtrl;