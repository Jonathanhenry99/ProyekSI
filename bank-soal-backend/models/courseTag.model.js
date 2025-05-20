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
  });

  return CourseTag;
};