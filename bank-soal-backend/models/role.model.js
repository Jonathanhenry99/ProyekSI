module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define("roles", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    }
  }, {
    underscored: true, // Menggunakan snake_case untuk nama kolom
    timestamps: false // Disable timestamps since we don't need them for roles
  });

  return Role;
};