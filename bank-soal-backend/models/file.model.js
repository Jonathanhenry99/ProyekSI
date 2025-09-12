module.exports = (sequelize, Sequelize) => {
  const File = sequelize.define("files", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    originalname: {  // Ubah dari originalName
      type: Sequelize.STRING,
      allowNull: false
    },
    filename: {  // Ubah dari fileName
      type: Sequelize.STRING,
      allowNull: false
    },
    filepath: {  // Ubah dari filePath
      type: Sequelize.STRING,
      allowNull: false
    },
    filetype: {  // Ubah dari fileType
      type: Sequelize.STRING, // PDF, DOCX, TXT
      allowNull: false
    },
    filesize: {  // Ubah dari fileSize
      type: Sequelize.INTEGER,
      allowNull: false
    },
    filecategory: {  // Ubah dari fileCategory
      type: Sequelize.STRING, // questions, answers, testCases
      allowNull: false
    },
    question_set_id: {  // Tambahkan field ini
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'question_sets',
        key: 'id'
      }
    }
  }, {
    // Tambahkan opsi ini untuk menggunakan nama kolom yang sama persis dengan definisi
    underscored: true,
    // Tentukan nama kolom timestamp secara eksplisit
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return File;
};