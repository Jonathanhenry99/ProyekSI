const db = require("../models");
const QuestionSet = db.questionSet;
const File = db.file;
const User = db.user;
const CourseTag = db.courseTag; // Change this line - use courseTag instead of course_tags
const fs = require("fs");

// Membuat question set baru
exports.createQuestionSet = async (req, res) => {
  try {
    // Validasi input
    if (!req.body.title || !req.body.subject) {
      return res.status(400).send({ message: "Judul dan mata kuliah harus diisi!" });
    }

    // Membuat question set baru
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

// Helper function untuk mendapatkan nama course berdasarkan ID
const getCourseNameById = async (subjectName) => {
  try {
    if (!subjectName) return null;
    
    // Add debug logging
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
    // Return the original subject name as fallback
    return subjectName;
  }
};

// Mendapatkan semua question set
exports.getAllQuestionSets = async (req, res) => {
  try {
    const questionSets = await QuestionSet.findAll({
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

    // PERBAIKAN: Tambahkan course name untuk setiap question set
    const questionSetsWithCourseNames = await Promise.all(
      questionSets.map(async (qs) => {
        const courseName = await getCourseNameById(qs.subject);
        return {
          ...qs.toJSON(),
          courseName: courseName,
          subjectName: courseName // Alias untuk backward compatibility
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
          attributes: ["id", "originalname", "filetype", "filecategory", "filepath"]
        }
      ]
    });

    if (!questionSet) {
      return res.status(404).send({ message: "Question set tidak ditemukan!" });
    }

    // Update jumlah download jika parameter download=true
    if (req.query.download === "true") {
      questionSet.downloads += 1;
      await questionSet.save();
    }

    // PERBAIKAN: Tambahkan course name
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

    console.log("Found question set:", {
      id: questionSet.id,
      title: questionSet.title,
      createdBy: questionSet.created_by || questionSet.createdBy
    });

    // Validasi input
    if (!req.body.title || !req.body.subject) {
      console.log("Missing required fields");
      return res.status(400).send({ 
        message: "Judul dan mata kuliah harus diisi!",
        success: false 
      });
    }

    // Debug topics data
    console.log("=== TOPICS DEBUG ===");
    console.log("req.body.topics type:", typeof req.body.topics);
    console.log("req.body.topics value:", req.body.topics);
    console.log("Array.isArray(req.body.topics):", Array.isArray(req.body.topics));

    // Handle topics conversion dengan lebih hati-hati
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
      // Fallback: convert apapun ke string
      processedTopics = String(req.body.topics || '');
      console.log("Fallback conversion:", processedTopics);
    }

    // Prepare update data
    const updateData = {
      title: req.body.title.trim(),
      description: req.body.description ? req.body.description.trim() : questionSet.description,
      subject: req.body.subject,
      year: parseInt(req.body.year) || questionSet.year,
      level: req.body.difficulty || questionSet.level,
      lecturer: req.body.lecturer ? req.body.lecturer.trim() : questionSet.lecturer,
      topics: processedTopics,
      last_updated: new Date()
    };

    console.log("Final updateData topics:", typeof updateData.topics, updateData.topics);
    console.log("Updating with data:", updateData);

    // Update data
    await questionSet.update(updateData);
    console.log("Question set updated successfully");

    // Fetch updated data dengan associations
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

    // PERBAIKAN: Ambil course name dari database atau dari req.body.subjectName
    let courseName = req.body.subjectName || null; // Gunakan yang dikirim dari frontend terlebih dahulu
    
    if (!courseName) {
      // Jika tidak ada di request body, ambil dari database
      courseName = await getCourseNameById(updatedQuestionSet.subject);
    }

    console.log("Course name resolved:", courseName);

    // PERBAIKAN: Response data dengan course name yang benar
    const responseData = {
      ...updatedQuestionSet.toJSON(),
      courseName: courseName,
      subjectName: courseName, // Untuk backward compatibility
      // Pastikan subject tetap berupa ID
      subject: updatedQuestionSet.subject
    };

    console.log("Final response data:", {
      id: responseData.id,
      title: responseData.title,
      subject: responseData.subject,
      courseName: responseData.courseName,
      subjectName: responseData.subjectName
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

// Mengupdate question set (original method - untuk backward compatibility)
exports.updateQuestionSet = async (req, res) => {
  try {
    const questionSet = await QuestionSet.findByPk(req.params.id);

    if (!questionSet) {
      return res.status(404).send({ message: "Question set tidak ditemukan!" });
    }

    // Update data
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

    // PERBAIKAN: Include course name in response
    const courseName = await getCourseNameById(questionSet.subject);
    const responseData = {
      ...questionSet.toJSON(),
      courseName: courseName,
      subjectName: courseName
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

    // Update data question set
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
    
    // Handle file uploads
    const fileCategories = ["soal", "kunci", "test"];     
    for (const category of fileCategories) {
      if (req.files && req.files[category]) {
        // Hapus file lama jika ada
        const oldFile = await File.findOne({ where: { question_set_id: questionSet.id, filecategory: category } });
        if (oldFile) {
          if (fs.existsSync(oldFile.filepath)) {
            fs.unlinkSync(oldFile.filepath);
          }
          await oldFile.destroy();
        }
        
        // Simpan file baru
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

    // PERBAIKAN: Include course name in response
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

// Menghapus question set
exports.deleteQuestionSet = async (req, res) => {
  try {
    const questionSet = await QuestionSet.findByPk(req.params.id);

    if (!questionSet) {
      return res.status(404).send({ message: "Question set tidak ditemukan!" });
    }

    // Hapus file terkait
    const files = await File.findAll({ where: { question_set_id: req.params.id } });
    for (const file of files) {
      // Hapus file fisik
      const filePath = file.filepath;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      // Hapus record di database
      await file.destroy();
    }

    // Hapus question set
    await questionSet.destroy();

    res.status(200).send({ message: "Question set berhasil dihapus!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};