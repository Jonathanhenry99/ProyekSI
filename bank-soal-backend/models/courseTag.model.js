// models/courseTag.model.js
module.exports = (sequelize, Sequelize) => {
  const CourseTag = sequelize.define("course_tags", {
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
    // Tidak perlu define created_at dan updated_at, Sequelize handle otomatis
  }, {
    timestamps: true, // Sequelize otomatis manage createdAt & updatedAt
    underscored: true, // Convert ke created_at & updated_at (snake_case)
    tableName: 'course_tags'
  });

  return CourseTag;
};