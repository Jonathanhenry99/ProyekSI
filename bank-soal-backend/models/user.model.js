// Pastikan definisi model seperti ini
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
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
    fullName: {
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
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  }, {
    underscored: true, // Menggunakan snake_case untuk nama kolom
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return User;
};
