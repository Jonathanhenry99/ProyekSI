module.exports = (sequelize, Sequelize) => {
  const QuestionHistory = sequelize.define("question_history", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    actionType: {
      type: Sequelize.STRING, // view, download, edit, delete
      allowNull: false
    },
    actionDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  });

  return QuestionHistory;
};