// middlewares/verifySignUp.js
const db = require("../models");
const User = db.user;

checkDuplicateEmail = async (req, res, next) => {
  try {
    // Check email
    const userEmail = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (userEmail) {
      return res.status(400).send({
        message: "Failed! Email is already in use!"
      });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate email!"
    });
  }
};

checkRolesExisted = (req, res, next) => {
  if (req.body.role) {
    if (!["ROLE_USER", "ROLE_ADMIN"].includes(req.body.role)) {
      res.status(400).send({
        message: "Failed! Role does not exist = " + req.body.role
      });
      return;
    }
  }
  
  next();
};

const verifySignUp = {
  checkDuplicateEmail: checkDuplicateEmail,
  checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;