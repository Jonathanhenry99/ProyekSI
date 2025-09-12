const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models
db.user = require("./user.model.js")(sequelize, Sequelize);
db.courseTag = require("./courseTag.model.js")(sequelize, Sequelize);
db.materialTag = require("./materialTag.model.js")(sequelize, Sequelize);
db.question = require("./question.model.js")(sequelize, Sequelize);
db.questionSet = require("./questionSet.model.js")(sequelize, Sequelize);
db.questionHistory = require("./questionHistory.model.js")(sequelize, Sequelize);
db.file = require("./file.model.js")(sequelize, Sequelize);

// Define relationships

// User and Question (One-to-Many)
db.user.hasMany(db.question, { as: "questions", foreignKey: "createdBy" });
db.question.belongsTo(db.user, { as: "creator", foreignKey: "createdBy" });

// Question and CourseTag (Many-to-Many)
db.question.belongsToMany(db.courseTag, {
  through: "question_course_tags",
  foreignKey: "questionId",
  otherKey: "courseTagId"
});
db.courseTag.belongsToMany(db.question, {
  through: "question_course_tags",
  foreignKey: "courseTagId",
  otherKey: "questionId"
});

// Question and MaterialTag (Many-to-Many)
db.question.belongsToMany(db.materialTag, {
  through: "question_material_tags",
  foreignKey: "questionId",
  otherKey: "materialTagId"
});
db.materialTag.belongsToMany(db.question, {
  through: "question_material_tags",
  foreignKey: "materialTagId",
  otherKey: "questionId"
});

// QuestionSet and Question (Many-to-Many with order)
db.questionSet.belongsToMany(db.question, {
  through: "question_set_items",
  foreignKey: "questionSetId",
  otherKey: "questionId"
});
db.question.belongsToMany(db.questionSet, {
  through: "question_set_items",
  foreignKey: "questionId",
  otherKey: "questionSetId"
});

// User and QuestionSet (One-to-Many)
db.user.hasMany(db.questionSet, { as: "questionSets", foreignKey: "createdBy" });
db.questionSet.belongsTo(db.user, { as: "creator", foreignKey: "createdBy" });

// QuestionHistory relationships - Fixed untuk QuestionSet
db.user.hasMany(db.questionHistory, { foreignKey: "userId" });
db.questionHistory.belongsTo(db.user, { foreignKey: "userId" });

// QuestionHistory with QuestionSet (bukan Question)
db.questionSet.hasMany(db.questionHistory, { foreignKey: "questionSetId" });
db.questionHistory.belongsTo(db.questionSet, { foreignKey: "questionSetId" });

// File relationships
db.questionSet.hasMany(db.file, { as: "files", foreignKey: "question_set_id" });
db.file.belongsTo(db.questionSet, { foreignKey: "question_set_id" });

module.exports = db;