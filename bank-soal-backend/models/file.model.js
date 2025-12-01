module.exports = (sequelize, Sequelize) => {
  const File = sequelize.define("files", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    originalname: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'originalname' // Match DB column name
    },
    filename: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'filename'
    },
    filepath: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'filepath'
    },
    filetype: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'filetype'
    },
    filesize: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'filesize'
    },
    filecategory: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'filecategory'
    },
    question_set_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'question_set_id',
      references: {
        model: 'question_sets',
        key: 'id'
      }
    },
    uploadedBy: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'uploaded_by', // ✅ Match DB
      references: {
        model: 'users',
        key: 'id'
      }
    },
    is_deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_deleted'
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true,
      field: 'deleted_at'
    },
    deleted_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'deleted_by',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // ✅ Update field names to match DB (snake_case)
    mimeType: {
      type: Sequelize.STRING(255),
      allowNull: true,
      field: 'mime_type' // ✅ Match DB column
    },
    languageType: {
      type: Sequelize.STRING(100),
      allowNull: true,
      field: 'language_type' // ✅ Match DB column
    },
    supportsPreview: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true,
      field: 'supports_preview' // ✅ Match DB column
    }
  }, {
    underscored: false, // ✅ Set to false since we're using explicit field mapping
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'files'
  });

  File.associate = function(models) {
    File.belongsTo(models.questionSet, {
      foreignKey: 'question_set_id',
      as: 'questionSet'
    });
    
    File.belongsTo(models.user, {
      foreignKey: 'uploaded_by', // ✅ Use snake_case
      as: 'uploader'
    });
    
    File.belongsTo(models.user, {
      foreignKey: 'deleted_by',
      as: 'deleter'
    });
  };

  File.addScope('active', {
    where: { is_deleted: false }
  });

  File.addScope('deleted', {
    where: { is_deleted: true }
  });

  File.addScope('withDeleted', {});

  File.prototype.softDelete = function(userId = null) {
    return this.update({
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: userId
    });
  };

  File.prototype.restore = function() {
    return this.update({
      is_deleted: false,
      deleted_at: null,
      deleted_by: null
    });
  };

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