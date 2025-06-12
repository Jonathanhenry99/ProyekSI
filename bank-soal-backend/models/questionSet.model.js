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
    },
    // Tambahan field untuk integrasi dengan Search.jsx
    subject: {
      type: Sequelize.STRING,
      allowNull: false
    },
    year: {
      type: Sequelize.INTEGER
    },
    level: {
      type: Sequelize.STRING // Mudah, Sedang, Sulit
    },
    lecturer: {
      type: Sequelize.STRING
    },
    topics: {
      type: Sequelize.TEXT // Disimpan sebagai string dengan pemisah koma
    },
    downloads: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    last_updated: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    // Tambahkan opsi ini untuk menggunakan nama kolom yang sama persis dengan definisi
    underscored: true,
    // Gunakan timestamps: false jika tidak ingin menggunakan created_at dan updated_at
    // timestamps: false
    // Atau tentukan nama kolom timestamp secara eksplisit
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return QuestionSet;
};