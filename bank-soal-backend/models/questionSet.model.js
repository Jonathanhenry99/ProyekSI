module.exports = (sequelize, Sequelize) => {
  const QuestionSet = sequelize.define("QuestionSet", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    subject: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    year: {
      type: Sequelize.INTEGER
    },
    level: {
      type: Sequelize.STRING(50),
      validate: {
        isIn: [['Mudah', 'Sedang', 'Sulit']]
      }
    },
    lecturer: {
      type: Sequelize.STRING(255)
    },
    topics: {
      type: Sequelize.TEXT,
       // Disimpan sebagai string dengan pemisah koma
    },
    downloads: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    last_updated: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    created_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'question_sets', // Eksplisit nama tabel sesuai database
    underscored: true, // Gunakan snake_case untuk kolom
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Define associations if needed
  QuestionSet.associate = function(models) {
    // Jika ada relasi dengan User model
    QuestionSet.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
  };

  return QuestionSet;
};