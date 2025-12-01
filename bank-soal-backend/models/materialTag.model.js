module.exports = (sequelize, Sequelize) => {
  const MaterialTag = sequelize.define("material_tags", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    }
    // Tidak perlu define created_at dan updated_at secara manual
  }, {
    timestamps: true, // Sequelize otomatis mengelola timestamps
    underscored: true, // Akan menggunakan created_at dan updated_at (snake_case)
    tableName: 'material_tags'
  });

  return MaterialTag;
};