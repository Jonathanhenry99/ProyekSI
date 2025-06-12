const db = require("../models");
const QuestionSet = db.questionSet;
const File = db.file;
const User = db.user;
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
      level: req.body.difficulty, // Pastikan ini konsisten dengan frontend
      lecturer: req.body.lecturer,
      topics: req.body.topics,
      last_updated: req.body.last_updated || new Date(), // Gunakan snake_case untuk konsistensi
      created_by: req.userId // Gunakan snake_case untuk konsistensi
    });

    res.status(201).send({
      message: "Question set berhasil dibuat!",
      questionSet: questionSet
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
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
          attributes: ["id", "username", "fullName", "email"] // Ubah name menjadi username dan fullName
        },
        {
          model: File,
          as: "files",
          attributes: ["id", "originalname", "filetype", "filecategory"]
        }
      ]
    });

    res.status(200).send(questionSets);
  } catch (error) {
    console.error("Error in getAllQuestionSets:", error); // Tambahkan log detail error
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
          attributes: ["id", "username", "fullName", "email"] // Ubah name menjadi username dan fullName
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

    res.status(200).send(questionSet);
  } catch (error) {
    console.error("Error in getQuestionSetById:", error); // Tambahkan log detail error
    res.status(500).send({ message: error.message });
  }
};

// Mengupdate question set
exports.updateQuestionSet = async (req, res) => {
  try {
    const questionSet = await QuestionSet.findByPk(req.params.id);

    if (!questionSet) {
      return res.status(404).send({ message: "Question set tidak ditemukan!" });
    }

    // Cek apakah user adalah pembuat question set
    if (questionSet.createdBy !== req.userId) {
      return res.status(403).send({ message: "Anda tidak memiliki akses untuk mengubah question set ini!" });
    }

    // Update data
    await questionSet.update({
      title: req.body.title || questionSet.title,
      description: req.body.description || questionSet.description,
      subject: req.body.subject || questionSet.subject,
      year: req.body.year || questionSet.year,
      level: req.body.difficulty || questionSet.level,
      lecturer: req.body.lecturer || questionSet.lecturer,
      topics: req.body.topics || questionSet.topics,
      last_updated: new Date()
    });

    res.status(200).send({ message: "Question set berhasil diperbarui!" });
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

    // Cek apakah user adalah pembuat question set atau admin
    if (questionSet.createdBy !== req.userId && !req.userRoles.includes("admin")) {
      return res.status(403).send({ message: "Anda tidak memiliki akses untuk menghapus question set ini!" });
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