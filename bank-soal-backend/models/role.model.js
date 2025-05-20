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
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Role;
};