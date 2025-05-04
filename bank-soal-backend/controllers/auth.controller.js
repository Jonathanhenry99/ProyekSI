const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
exports.signin = async (req, res) => {
  try {
    console.log("Data yang diterima dari frontend:", req.body);

    const user = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    console.log("Password dari database:", user.password);

    console.log("Data yang diterima dari frontend:", req.body);

    const passwordIsValid = bcrypt.compareSync(
      req.body.password.trim(), // Hapus spasi di awal dan akhir
      user.password
    );

    console.log("Password dari frontend (raw length):", req.body.password.length);
    console.log("Password dari frontend (trim length):", req.body.password.trim().length);
    console.log("Hasil compare:", passwordIsValid); // Periksa hasil compare

    if (!passwordIsValid) {
      console.log("Password tidak valid");
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!"
      });
    }

    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.jwtExpiration
    });

    let authorities = [];
    const roles = await user.getRoles();
    for (let i = 0; i < roles.length; i++) {
      authorities.push("ROLE_" + roles[i].name.toUpperCase());
    }

    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      roles: authorities,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};