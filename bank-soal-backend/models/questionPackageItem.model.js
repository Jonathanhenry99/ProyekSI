module.exports = (sequelize, Sequelize) => {
  const QuestionPackageItem = sequelize.define("question_package_items", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    question_package_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "question_packages",
        key: "id"
      },
      onDelete: "CASCADE"
    },
    question_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "question_sets",
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

  return QuestionPackageItem;
};
