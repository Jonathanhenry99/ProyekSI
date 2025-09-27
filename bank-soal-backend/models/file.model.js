module.exports = (sequelize, Sequelize) => {
  const File = sequelize.define("files", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    originalname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    filename: {
      type: Sequelize.STRING,
      allowNull: false
    },
    filepath: {
      type: Sequelize.STRING,
      allowNull: false
    },
    filetype: {
      type: Sequelize.STRING, // PDF, DOCX, TXT
      allowNull: false
    },
    filesize: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    filecategory: {
      type: Sequelize.STRING, // questions, answers, testCases
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
    // ===== TAMBAHAN KOLOM UNTUK SOFT DELETE =====
    is_deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  }, {
    // Tambahkan opsi ini untuk menggunakan nama kolom yang sama persis dengan definisi
    underscored: true,
    // Tentukan nama kolom timestamp secara eksplisit
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // ===== TAMBAHAN SCOPES =====
  // Default scope untuk hanya mengambil file yang tidak dihapus
  File.addScope('active', {
    where: {
      is_deleted: false
    }
  });
  File.associate = function(models) {
    File.belongsTo(models.QuestionSet, {
      foreignKey: 'question_set_id',
      as: 'questionSet'
    });
  };

  

  // Scope untuk mengambil file yang dihapus
  File.addScope('deleted', {
    where: {
      is_deleted: true
    }
  });

  // Scope untuk mengambil semua file (termasuk yang dihapus)
  File.addScope('withDeleted', {
    // No where clause, includes all files
  });

  // ===== TAMBAHAN INSTANCE METHODS =====
  File.prototype.softDelete = function() {
    return this.update({
      is_deleted: true,
      deleted_at: new Date()
    });
  };

  File.prototype.restore = function() {
    return this.update({
      is_deleted: false,
      deleted_at: null
    });
  };

  // ===== TAMBAHAN CLASS METHODS =====
  File.findActive = function(options = {}) {
    return this.scope('active').findAll(options);
  };

  File.findDeleted = function(options = {}) {
    return this.scope('deleted').findAll(options);
  };

  File.findWithDeleted = function(options = {}) {
    return this.scope('withDeleted').findAll(options);
  };

  return File;
};