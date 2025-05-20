module.exports = (sequelize, Sequelize) => {
  const Question = sequelize.define("questions", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    difficultyLevel: {
      type: Sequelize.STRING, // Mudah, Sedang, Sulit
      allowNull: false
    },
    questionType: {
      type: Sequelize.STRING, // Essay, Coding, dll
      allowNull: false
    }
  });

  return Question;
};