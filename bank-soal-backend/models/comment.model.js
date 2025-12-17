module.exports = (sequelize, Sequelize) => {
  const Comment = sequelize.define("Comment", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    question_set_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'question_sets',
        key: 'id'
      }
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // Soft delete fields
    is_deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    deleted_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'comments',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Comment;
};

