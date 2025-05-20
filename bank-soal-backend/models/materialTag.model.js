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
  });

  return MaterialTag;
};