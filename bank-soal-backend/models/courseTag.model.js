// models/course_tag.model.js (Revisi untuk menonaktifkan timestamps)
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
    },
    // Jika Anda memiliki kolom created_at atau updated_at di DB

    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    timestamps: true, // <<< Set ini menjadi FALSE untuk menonaktifkan createdAt dan updatedAt otomatis
    underscored: true, // Biarkan ini jika kolom DB Anda menggunakan snake_case (created_at, updated_at)
    tableName: 'course_tags' // Pastikan nama tabel cocok
  });

  return CourseTag;
};