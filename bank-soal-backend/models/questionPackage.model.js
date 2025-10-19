module.exports = (sequelize, Sequelize) => {
  const QuestionPackage = sequelize.define("question_packages", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    course_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "course_tags", // atau "courses" tergantung struktur kamu
        key: "id"
      },
      onDelete: "CASCADE"
    },
    created_by: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      },
      onDelete: "CASCADE"
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    timestamps: false,
    freezeTableName: true
  });

  return QuestionPackage;
};
