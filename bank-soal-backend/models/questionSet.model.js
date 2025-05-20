module.exports = (sequelize, Sequelize) => {
  const QuestionSet = sequelize.define("question_sets", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    }
  });

  return QuestionSet;
};