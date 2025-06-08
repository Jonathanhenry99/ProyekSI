const db = require("../models");
const File = db.file;
const fs = require("fs");
const path = require("path");

// Upload file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "Silakan pilih file untuk diupload!" });
    }

    if (!req.body.questionSetId) {
      // Hapus file jika tidak ada questionSetId
      fs.unlinkSync(req.file.path);
      return res.status(400).send({ message: "Question set ID diperlukan!" });
    }

    // Simpan informasi file ke database
    const file = await File.create({
      originalname: req.file.originalname,
      filename: req.file.filename,
      filepath: req.file.path,
      filetype: path.extname(req.file.originalname).substring(1).toUpperCase(),
      filesize: req.file.size,
      filecategory: req.body.fileCategory || "questions",
      question_set_id: req.body.questionSetId
    });

    res.status(201).send({
      message: "File berhasil diupload!",
      file: {
        id: file.id,
        originalname: file.originalname,
        filetype: file.filetype,
        filecategory: file.filecategory
      }
    });
  } catch (error) {
    // Hapus file jika terjadi error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).send({ message: error.message });
  }
};

// Download file
exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);

    if (!file) {
      return res.status(404).send({ message: "File tidak ditemukan!" });
    }

    // Cek apakah file ada di sistem
    if (!fs.existsSync(file.filepath)) {
      return res.status(404).send({ message: "File fisik tidak ditemukan!" });
    }

    // Set header untuk download
    res.setHeader("Content-Disposition", `attachment; filename="${file.originalname}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    // Stream file ke response
    const fileStream = fs.createReadStream(file.filepath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Hapus file
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);

    if (!file) {
      return res.status(404).send({ message: "File tidak ditemukan!" });
    }

    // Hapus file fisik
    if (fs.existsSync(file.filepath)) {
      fs.unlinkSync(file.filepath);
    }

    // Hapus record di database
    await file.destroy();

    res.status(200).send({ message: "File berhasil dihapus!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Preview file (terutama untuk TXT)
exports.previewFile = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);

    if (!file) {
      return res.status(404).send({ message: "File tidak ditemukan!" });
    }

    // Cek apakah file ada di sistem
    if (!fs.existsSync(file.filepath)) {
      return res.status(404).send({ message: "File fisik tidak ditemukan!" });
    }

    // Untuk file TXT, kirim konten sebagai text
    if (file.filetype.toLowerCase() === 'txt') {
      const content = fs.readFileSync(file.filepath, 'utf8');
      res.setHeader('Content-Type', 'text/plain');
      return res.send(content);
    }

    // Untuk file lain, kirim sebagai download biasa
    res.setHeader("Content-Disposition", `inline; filename="${file.originalname}"`);
    
    // Set content type berdasarkan tipe file
    if (file.filetype.toLowerCase() === 'pdf') {
      res.setHeader("Content-Type", "application/pdf");
    } else {
      res.setHeader("Content-Type", "application/octet-stream");
    }

    // Stream file ke response
    const fileStream = fs.createReadStream(file.filepath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};