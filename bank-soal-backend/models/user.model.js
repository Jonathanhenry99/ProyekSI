// models/user.model.js
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: { // Assuming username is same as email for dosen
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    fullName: { // Changed to fullName for consistency with camelCase in JS
      type: Sequelize.STRING,
      allowNull: false
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'ROLE_USER',
      validate: {
        isIn: [['ROLE_USER', 'ROLE_ADMIN']]
      }
    },
    isActive: { // Changed to isActive for consistency with camelCase in JS
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  }, {
    underscored: true, // This will map fullName to full_name and isActive to is_active in DB
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return User;
};