const db = require("../models");
const User = db.user;
const bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;

// Admin creates a new user (since you mentioned no self-signup)
exports.createUser = async (req, res) => {
  // Only admins can create users, middleware will handle this check
  try {
    // Create user
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      fullName: req.body.fullName,
      role: req.body.role || 'ROLE_USER',
      department: req.body.department
    });

    res.send({ message: "User was registered successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'fullName', 'role', 'department', 'isActive']
    });
    
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    
    // Update user fields
    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.department) user.department = req.body.department;
    if (req.body.role) user.role = req.body.role;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
    if (req.body.password) {
      user.password = bcrypt.hashSync(req.body.password, 8);
    }
    
    await user.save();
    
    res.send({ message: "User was updated successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  
  try {
    const result = await User.destroy({
      where: { id: userId }
    });
    
    if (result === 1) {
      res.send({ message: "User was deleted successfully!" });
    } else {
      res.send({ message: "User not found or already deleted." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};