const db = require("../models");
const QuestionPackage = db.question_packages;
const QuestionPackageItem = db.question_package_items;
const QuestionSet = db.questionSet;
const CourseTag = db.courseTag;
const User = db.user;

// CREATE
exports.create = async (req, res) => {
  try {
    const { title, description, course_id, questionSetIds } = req.body;

    if (!course_id) {
      return res.status(400).send({ message: "course_id tidak boleh kosong" });
    }

    const newPackage = await db.question_packages.create({
      title,
      description,
      course_id,
      created_by: req.userId,
    });

    if (questionSetIds && questionSetIds.length > 0) {
      const items = questionSetIds.map((qId) => ({
        question_package_id: newPackage.id,
        question_id: qId,
      }));
      await db.question_package_items.bulkCreate(items);
    }

    res.status(201).send(newPackage);
  } catch (err) {
    console.error("❌ Error creating question package:", err);
    res.status(500).send({ message: err.message });
  }
};

// FIND ALL
exports.findAll = async (req, res) => {
  try {
    const packages = await QuestionPackage.findAll({
      include: [
        { model: QuestionPackageItem, as: "items" },
        { model: db.user, as: "creator", attributes: ["id", "full_name", "username"] },
        { model: db.courseTag, as: "course", attributes: ["id", "name"] }
      ],
      order: [["created_at", "DESC"]]
    });

    // Tambahkan perhitungan jumlah soal
    const packagesWithCount = packages.map(pkg => ({
      ...pkg.toJSON(),
      questionCount: pkg.items ? pkg.items.length : 0
    }));

    res.send(packagesWithCount);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// controllers/questionPackage.controller.js

// FIND ONE
exports.findOne = async (req, res) => {
  try {
    const packageId = req.params.id;

    // 1. Perbaikan: Validasi ID Parameter di Awal
    if (!packageId || packageId === 'undefined' || packageId === 'null' || isNaN(packageId)) {
      // Mengembalikan 400 Bad Request jika ID tidak valid
      return res.status(400).send({ message: "ID paket soal tidak valid atau tidak diberikan." });
    }

    const pkg = await db.question_packages.findOne({
      where: { id: packageId }, // Menggunakan packageId yang sudah divalidasi
      include: [
        { model: db.courseTag, as: "course" },
        { model: db.user, as: "creator", attributes: ["id", "full_name", "email"] },
        {
          model: db.question_package_items,
          as: "items",
          include: [{ model: db.questionSet, as: "question" }]
        }
      ]
    });


    // 2. Logika 404 tetap dipertahankan
    if (!pkg) {
      // Mengembalikan 404 Not Found jika ID valid tapi data tidak ada
      return res.status(404).send({ message: "Paket soal tidak ditemukan" });
    }

    res.status(200).send(pkg);
  } catch (err) {
    console.error("❌ Error fetching question package:", err);
    res.status(500).send({ message: err.message });
  }
};


// DELETE
exports.delete = async (req, res) => {
  try {
    const deleted = await QuestionPackage.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).send({ message: "Not found" });
    res.send({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// INCREMENT DOWNLOAD COUNT
exports.incrementDownload = async (req, res) => {
  try {
    const packageId = req.params.id;

    if (!packageId || isNaN(packageId)) {
      return res.status(400).send({ message: "ID paket soal tidak valid." });
    }

    const pkg = await QuestionPackage.findByPk(packageId);

    if (!pkg) {
      return res.status(404).send({ message: "Paket soal tidak ditemukan." });
    }

    const currentDownloads = pkg.downloads || 0;
    pkg.downloads = currentDownloads + 1;
    await pkg.save();

    res.status(200).send({
      message: "Download paket berhasil dicatat.",
      id: pkg.id,
      downloads: pkg.downloads
    });
  } catch (err) {
    console.error("❌ Error incrementing package downloads:", err);
    res.status(500).send({ message: "Gagal memperbarui jumlah unduhan." });
  }
};