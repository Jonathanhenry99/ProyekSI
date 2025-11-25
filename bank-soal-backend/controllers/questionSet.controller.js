const db = require("../models");
const QuestionSet = db.questionSet;
const File = db.file;
const User = db.user;
const CourseTag = db.courseTag;
const fs = require("fs");
const { Op } = require("sequelize");



// Helper function untuk mendapatkan nama course berdasarkan ID
const getCourseNameById = async (subjectName) => {
  try {
    if (!subjectName) return null;
    
    console.log('Looking up course tag for subject:', subjectName);
    console.log('CourseTag model available:', !!CourseTag);
    
    const courseTag = await CourseTag.findOne({
      where: { name: subjectName },
      attributes: ['id', 'name']
    });
    
    console.log('Found course tag:', courseTag);
    return courseTag ? courseTag.name : subjectName;
  } catch (error) {
    console.error('Error getting course name:', error);
    return subjectName;
  }
};

// Membuat question set baru
exports.createQuestionSet = async (req, res) => {
  try {
    if (!req.body.title || !req.body.subject) {
      return res.status(400).send({ message: "Judul dan mata kuliah harus diisi!" });
    }

    const questionSet = await QuestionSet.create({
      title: req.body.title,
      description: req.body.description,
      subject: req.body.subject,
      year: req.body.year,
      level: req.body.difficulty,
      lecturer: req.body.lecturer,
      topics: Array.isArray(req.body.topics) 
        ? req.body.topics.join(', ') 
        : (req.body.topics || ''),
      last_updated: req.body.last_updated || new Date(),
      created_by: req.userId
    });

    res.status(201).send({
      message: "Question set berhasil dibuat!",
      questionSet: questionSet
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Mendapatkan semua question set (EXCLUDE DELETED)
exports.getAllQuestionSets = async (req, res) => {
  try {
    const questionSets = await QuestionSet.findAll({
      where: {
        [Op.or]: [
          { is_deleted: false },
          { is_deleted: { [Op.is]: null } }
        ]
      },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "fullName", "email"]
        },
        {
          model: File,
          as: "files",
          attributes: ["id", "originalname", "filetype", "filecategory"],
          where: {
            [Op.or]: [
              { is_deleted: false },
              { is_deleted: { [Op.is]: null } }
            ]
          },
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const questionSetsWithCourseNames = await Promise.all(
      questionSets.map(async (qs) => {
        const courseName = await getCourseNameById(qs.subject);
        return {
          ...qs.toJSON(),
          courseName: courseName,
          subjectName: courseName
        };
      })
    );

    res.status(200).send(questionSetsWithCourseNames);
  } catch (error) {
    console.error("Error in getAllQuestionSets:", error);
    res.status(500).send({ message: error.message });
  }
};

// Mendapatkan question set berdasarkan ID
exports.getQuestionSetById = async (req, res) => {
  try {
    const questionSet = await QuestionSet.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "fullName", "email"]
        },
        {
          model: File,
          as: "files",
          attributes: ["id", "originalname", "filetype", "filecategory", "filepath"],
          where: {
            [Op.or]: [
              { is_deleted: false },
              { is_deleted: { [Op.is]: null } }
            ]
          },
          required: false
        }
      ]
    });

    if (!questionSet) {
      return res.status(404).send({ message: "Question set tidak ditemukan!" });
    }

    // Check if deleted
    if (questionSet.is_deleted) {
      return res.status(404).send({ message: "Question set telah dihapus!" });
    }

    // Update jumlah download jika parameter download=true
    if (req.query.download === "true") {
      questionSet.downloads += 1;
      await questionSet.save();
    }

    const courseName = await getCourseNameById(questionSet.subject);
    const responseData = {
      ...questionSet.toJSON(),
      courseName: courseName,
      subjectName: courseName
    };

    res.status(200).send(responseData);
  } catch (error) {
    console.error("Error in getQuestionSetById:", error);
    res.status(500).send({ message: error.message });
  }
};

// ==================== SOFT DELETE FUNCTIONS ====================

// Soft Delete Question Set
exports.softDeleteQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log(`🗑️ Soft delete request for question set ID: ${id} by user: ${userId}`);

    const questionSet = await QuestionSet.findByPk(id);

    if (!questionSet) {
      return res.status(404).send({
        success: false,
        message: "Question set tidak ditemukan!"
      });
    }

    // Check if already deleted
    if (questionSet.is_deleted) {
      return res.status(400).send({
        success: false,
        message: "Question set sudah dihapus sebelumnya!"
      });
    }

    // Update to soft delete
    await questionSet.update({
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: userId,
      last_updated: new Date()
    });

    console.log(`✅ Question set ${id} soft deleted successfully`);

    res.status(200).send({
      success: true,
      message: "Question set berhasil dipindahkan ke Recycle Bin",
      data: questionSet
    });

  } catch (error) {
    console.error("❌ Error in softDeleteQuestionSet:", error);
    res.status(500).send({
      success: false,
      message: "Gagal menghapus question set",
      error: error.message
    });
  }
};

// Get Recycle Bin (Deleted Question Sets)
exports.getRecycleBin = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`🔄 Fetching recycle bin for user: ${userId}`);

    // Simple query first - no complex joins
    const deletedQuestionSets = await QuestionSet.findAll({
      where: {
        is_deleted: true
      },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "fullName", "email"],
          required: false
        },
        {
          model: File,
          as: "files",
          attributes: ["id", "originalname", "filetype", "filecategory"],
          required: false,
          where: {
            [Op.or]: [
              { is_deleted: false },
              { is_deleted: { [Op.is]: null } }
            ]
          }
        }
      ],
      order: [['deleted_at', 'DESC']]
    });

    console.log(`📦 Raw query result: ${deletedQuestionSets.length} items`);

    // Transform data
    const questionSetsWithCourseNames = await Promise.all(
      deletedQuestionSets.map(async (qs) => {
        try {
          const courseName = await getCourseNameById(qs.subject);
          
          return {
            ...qs.toJSON(),
            courseName: courseName || qs.subject,
            subjectName: courseName || qs.subject,
            // Add deletedByUser info if available
            deletedByUsername: null // Will be populated if association works
          };
        } catch (error) {
          console.error(`Error processing question set ${qs.id}:`, error);
          return {
            ...qs.toJSON(),
            courseName: qs.subject,
            subjectName: qs.subject,
            deletedByUsername: null
          };
        }
      })
    );

    console.log(`✅ Found ${questionSetsWithCourseNames.length} deleted question sets`);

    res.status(200).send({
      success: true,
      data: questionSetsWithCourseNames,
      count: questionSetsWithCourseNames.length
    });

  } catch (error) {
    console.error("❌ Error in getRecycleBin:", error);
    console.error("❌ Error stack:", error.stack);
    
    // Send detailed error for debugging
    res.status(500).send({
      success: false,
      message: "Gagal mengambil data recycle bin",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Restore Question Set from Recycle Bin
exports.restoreQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log(`♻️ Restore request for question set ID: ${id} by user: ${userId}`);

    const questionSet = await QuestionSet.findByPk(id);

    if (!questionSet) {
      return res.status(404).send({
        success: false,
        message: "Question set tidak ditemukan!"
      });
    }

    // Check if not deleted
    if (!questionSet.is_deleted) {
      return res.status(400).send({
        success: false,
        message: "Question set tidak ada di recycle bin!"
      });
    }

    // Restore
    await questionSet.update({
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      last_updated: new Date()
    });

    console.log(`✅ Question set ${id} restored successfully`);

    const courseName = await getCourseNameById(questionSet.subject);
    const responseData = {
      ...questionSet.toJSON(),
      courseName: courseName,
      subjectName: courseName
    };

    res.status(200).send({
      success: true,
      message: "Question set berhasil dipulihkan",
      data: responseData
    });

  } catch (error) {
    console.error("❌ Error in restoreQuestionSet:", error);
    res.status(500).send({
      success: false,
      message: "Gagal memulihkan question set",
      error: error.message
    });
  }
};

// Permanent Delete Question Set
exports.permanentDeleteQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log(`🗑️ Permanent delete request for question set ID: ${id} by user: ${userId}`);

    const questionSet = await QuestionSet.findByPk(id, {
      include: [
        {
          model: File,
          as: "files"
        }
      ]
    });

    if (!questionSet) {
      return res.status(404).send({
        success: false,
        message: "Question set tidak ditemukan!"
      });
    }

    // Check if in recycle bin
    if (!questionSet.is_deleted) {
      return res.status(400).send({
        success: false,
        message: "Question set harus ada di recycle bin sebelum dihapus permanen!"
      });
    }

    // Delete physical files
    if (questionSet.files && questionSet.files.length > 0) {
      for (const file of questionSet.files) {
        if (fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
          console.log(`🗑️ Deleted physical file: ${file.filepath}`);
        }
        await file.destroy();
      }
    }

    // Permanent delete from database
    await questionSet.destroy();

    console.log(`✅ Question set ${id} permanently deleted`);

    res.status(200).send({
      success: true,
      message: "Question set berhasil dihapus permanen"
    });

  } catch (error) {
    console.error("❌ Error in permanentDeleteQuestionSet:", error);
    res.status(500).send({
      success: false,
      message: "Gagal menghapus question set secara permanen",
      error: error.message
    });
  }
};


// UPDATE SEDERHANA TANPA FILE - UNTUK FRONTEND EDIT MODAL
exports.updateQuestionSetSimple = async (req, res) => {
  try {
    console.log("Simple update request received");
    console.log("Request params ID:", req.params.id);
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("User ID from token:", req.userId);

    const questionSet = await QuestionSet.findByPk(req.params.id);

    if (!questionSet) {
      console.log("Question set not found for ID:", req.params.id);
      return res.status(404).send({ 
        message: "Question set tidak ditemukan!",
        success: false 
      });
    }

    // Check if deleted
    if (questionSet.is_deleted) {
      return res.status(400).send({
        success: false,
        message: "Tidak dapat mengupdate question set yang telah dihapus!"
      });
    }

    console.log("Found question set:", {
      id: questionSet.id,
      title: questionSet.title,
      createdBy: questionSet.created_by || questionSet.createdBy
    });

    if (!req.body.title || !req.body.subject) {
      console.log("Missing required fields");
      return res.status(400).send({ 
        message: "Judul dan mata kuliah harus diisi!",
        success: false 
      });
    }

    console.log("=== TOPICS DEBUG ===");
    console.log("req.body.topics type:", typeof req.body.topics);
    console.log("req.body.topics value:", req.body.topics);
    console.log("Array.isArray(req.body.topics):", Array.isArray(req.body.topics));

    let processedTopics;
    if (Array.isArray(req.body.topics)) {
      processedTopics = req.body.topics.join(', ');
      console.log("Converted array to string:", processedTopics);
    } else if (typeof req.body.topics === 'string') {
      processedTopics = req.body.topics;
      console.log("Using string as is:", processedTopics);
    } else if (req.body.topics === null || req.body.topics === undefined) {
      processedTopics = questionSet.topics || '';
      console.log("Using existing topics:", processedTopics);
    } else {
      processedTopics = String(req.body.topics || '');
      console.log("Fallback conversion:", processedTopics);
    }

    // ============ PERBAIKAN DI SINI ============
    let finalSubjectName = questionSet.subject; // Default: pakai yang lama

    // Jika user mengirim subject baru (berupa ID)
    if (req.body.subject) {
      console.log("=== SUBJECT CONVERSION DEBUG ===");
      console.log("Received subject ID:", req.body.subject);
      
      // Cari course berdasarkan ID
      const course = await CourseTag.findByPk(req.body.subject);
      
      if (course) {
        finalSubjectName = course.name; // Ambil NAMA dari course
        console.log("Converted subject ID to name:", finalSubjectName);
      } else {
        console.log("Course not found for ID:", req.body.subject);
        // Jika ID tidak ditemukan, tetap gunakan yang lama
        finalSubjectName = questionSet.subject;
      }
    }
    
    console.log("Final subject name to save:", finalSubjectName);
    
    const updateData = {
        title: req.body.title.trim(),
        description: req.body.description ? req.body.description.trim() : questionSet.description,
        
        subject: finalSubjectName, // Simpan NAMA, bukan ID
        
        year: parseInt(req.body.year) || questionSet.year,
        level: req.body.difficulty || questionSet.level,
        lecturer: req.body.lecturer ? req.body.lecturer.trim() : questionSet.lecturer,
        topics: processedTopics,
        last_updated: new Date()
    };

    console.log("Final updateData:", updateData);

    await questionSet.update(updateData);
    console.log("Question set updated successfully");

    const updatedQuestionSet = await QuestionSet.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "fullName", "email"]
        },
        {
          model: File,
          as: "files",
          attributes: ["id", "originalname", "filetype", "filecategory"]
        }
      ]
    });

    // Untuk response, subject sudah berupa nama
    const responseData = {
      ...updatedQuestionSet.toJSON(),
      courseName: updatedQuestionSet.subject, // subject sudah berupa nama
      subjectName: updatedQuestionSet.subject,
      subject: updatedQuestionSet.subject
    };

    console.log("Final response data:", {
      id: responseData.id,
      title: responseData.title,
      subject: responseData.subject
    });

    res.status(200).send({ 
      message: "Question set berhasil diperbarui!",
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("Error in updateQuestionSetSimple:", error);
    res.status(500).send({ 
      message: error.message,
      success: false 
    });
  }
};
// Mengupdate question set (original method)
exports.updateQuestionSet = async (req, res) => {
  try {
    const questionSet = await QuestionSet.findByPk(req.params.id);

    if (!questionSet) {
      return res.status(404).send({ message: "Question set tidak ditemukan!" });
    }

    if (questionSet.is_deleted) {
      return res.status(400).send({
        success: false,
        message: "Tidak dapat mengupdate question set yang telah dihapus!"
      });
    }

    // ============ KONVERSI ID KE NAMA ============
    let finalSubjectName = questionSet.subject; // Default: pakai yang lama

    if (req.body.subject) {
      console.log("Converting subject ID to name:", req.body.subject);
      const course = await CourseTag.findByPk(req.body.subject);
      
      if (course) {
        finalSubjectName = course.name;
        console.log("Subject name:", finalSubjectName);
      } else {
        console.log("Course not found, keeping old subject");
      }
    }
    // ============================================

    await questionSet.update({
      title: req.body.title || questionSet.title,
      description: req.body.description || questionSet.description,
      subject: finalSubjectName, // ← SIMPAN NAMA, BUKAN ID
      year: req.body.year || questionSet.year,
      level: req.body.difficulty || questionSet.level,
      lecturer: req.body.lecturer || questionSet.lecturer,
      topics: Array.isArray(req.body.topics) 
        ? req.body.topics.join(', ') 
        : (req.body.topics || questionSet.topics),
      last_updated: new Date()
    });

    // Subject sudah berupa nama, jadi bisa langsung dipakai
    const responseData = {
      ...questionSet.toJSON(),
      courseName: questionSet.subject, // subject sudah nama
      subjectName: questionSet.subject
    };

    res.status(200).send({ 
      message: "Question set berhasil diperbarui!",
      data: responseData
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.updateQuestionSetWithFiles = async (req, res) => {
  try {
    const questionSet = await QuestionSet.findByPk(req.params.id);

    if (!questionSet) {
      return res.status(404).send({ message: "Question set tidak ditemukan!" });
    }

    if (questionSet.is_deleted) {
      return res.status(400).send({
        success: false,
        message: "Tidak dapat mengupdate question set yang telah dihapus!"
      });
    }

    await questionSet.update({
      title: req.body.title || questionSet.title,
      description: req.body.description || questionSet.description,
      subject: req.body.subject || questionSet.subject,
      year: req.body.year || questionSet.year,
      level: req.body.difficulty || questionSet.level,
      lecturer: req.body.lecturer || questionSet.lecturer,
      topics: Array.isArray(req.body.topics) 
        ? req.body.topics.join(', ') 
        : (req.body.topics || questionSet.topics),
      last_updated: new Date()
    });   
    
    const fileCategories = ["soal", "kunci", "test"];     
    for (const category of fileCategories) {
      if (req.files && req.files[category]) {
        const oldFile = await File.findOne({ 
          where: { 
            question_set_id: questionSet.id, 
            filecategory: category 
          } 
        });
        
        if (oldFile) {
          if (fs.existsSync(oldFile.filepath)) {
            fs.unlinkSync(oldFile.filepath);
          }
          await oldFile.destroy();
        }
        
        const uploadedFile = req.files[category][0];
        await File.create({
          originalname: uploadedFile.originalname,
          filetype: uploadedFile.mimetype,
          filepath: uploadedFile.path,
          filecategory: category,
          question_set_id: questionSet.id
        });
      }
    }

    const courseName = await getCourseNameById(questionSet.subject);
    const responseData = {
      ...questionSet.toJSON(),
      courseName: courseName,
      subjectName: courseName
    };
    
    res.status(200).send({ 
      message: "Question set dan file berhasil diperbarui!",
      questionSet: responseData
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// ==================== DELETE FUNCTION (LEGACY) ====================

// Menghapus question set (DEPRECATED - use softDeleteQuestionSet instead)
exports.deleteQuestionSet = async (req, res) => {
  try {
    const questionSet = await QuestionSet.findByPk(req.params.id);

    if (!questionSet) {
      return res.status(404).send({ 
        success: false,
        message: "Question set tidak ditemukan!" 
      });
    }

    // Hapus file terkait
    const files = await File.findAll({ where: { question_set_id: req.params.id } });
    for (const file of files) {
      const filePath = file.filepath;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await file.destroy();
    }

    // Hapus question set
    await questionSet.destroy();

    res.status(200).send({ 
      success: true,
      message: "Question set berhasil dihapus!" 
    });
  } catch (error) {
    res.status(500).send({ 
      success: false,
      message: error.message 
    });
  }
};