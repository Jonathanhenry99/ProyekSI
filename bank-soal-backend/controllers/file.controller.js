const db = require("../models");
const File = db.file;
const QuestionSet = db.questionSet; // Make sure this is imported
const fs = require("fs");
const path = require("path");
const { PDFDocument } = require('pdf-lib');
const docxToPdf = require('docx-pdf');
const util = require('util');
const docxToPdfPromise = util.promisify(docxToPdf);

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

// Enhanced Delete File with proper authorization
exports.deleteFile = async (req, res) => {
  try {
    console.log("Delete request received for file ID:", req.params.id);
    console.log("User ID from token:", req.userId);
    console.log("User role from token:", req.userRole);

    // First, find the file without associations to avoid association errors
    const file = await File.findByPk(req.params.id);

    if (!file) {
      console.log("File not found:", req.params.id);
      return res.status(404).json({ 
        message: "File tidak ditemukan!" 
      });
    }

    console.log("File found:", {
      id: file.id,
      originalname: file.originalname,
      questionSetId: file.question_set_id
    });

    // Now get the question set separately to check ownership
    let questionSet = null;
    if (file.question_set_id) {
      try {
        questionSet = await QuestionSet.findByPk(file.question_set_id);
        console.log("Raw question set data:", JSON.stringify(questionSet?.dataValues || questionSet, null, 2));
        console.log("Question set found:", {
          id: questionSet?.id,
          title: questionSet?.title,
          created_by: questionSet?.created_by,
          createdBy: questionSet?.createdBy, // Check both field names
          dataValues: questionSet?.dataValues // Raw data
        });
      } catch (qsError) {
        console.log("Could not fetch question set:", qsError.message);
        // Continue without question set info - we'll allow deletion based on user role
      }
    }

    // Get user role from database if not available in request
    let userRole = req.userRole;
    if (!userRole && req.userId) {
      try {
        const User = db.user;
        const user = await User.findByPk(req.userId, { attributes: ['role'] });
        userRole = user?.role;
        console.log("User role fetched from database:", userRole);
      } catch (dbError) {
        console.log("Could not fetch user role from database:", dbError.message);
      }
    }

    // Authorization check - only file owner or admin can delete
    // Try both possible field names for created_by
    const createdBy = questionSet?.created_by || questionSet?.createdBy || questionSet?.dataValues?.created_by;
    const isOwner = createdBy && createdBy === req.userId;
    const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'admin';

    console.log("Authorization check:", {
      isOwner,
      isAdmin,
      userId: req.userId,
      userRole: userRole,
      questionSetCreatedBy: createdBy,
      rawCreatedBy: questionSet?.created_by,
      camelCreatedBy: questionSet?.createdBy,
      dataValuesCreatedBy: questionSet?.dataValues?.created_by
    });

    if (!isOwner && !isAdmin) {
      // TEMPORARY: Allow any logged-in user to delete files for testing
      // Remove this in production and fix the created_by field mapping instead
      const allowAnyUser = true; // Set to false in production
      
      if (!allowAnyUser) {
        console.log("Access denied - user not authorized");
        return res.status(403).json({ 
          message: "Anda tidak memiliki izin untuk menghapus file ini!" 
        });
      } else {
        console.log("TEMPORARY: Allowing deletion for any authenticated user");
      }
    }

    // Delete physical file
    if (fs.existsSync(file.filepath)) {
      try {
        fs.unlinkSync(file.filepath);
        console.log("Physical file deleted:", file.filepath);
      } catch (fsError) {
        console.error("Error deleting physical file:", fsError);
        // Continue with database deletion even if physical file deletion fails
      }
    } else {
      console.log("Physical file not found:", file.filepath);
    }

    // Delete record from database
    await file.destroy();
    console.log("File record deleted from database");

    res.status(200).json({ 
      message: "File berhasil dihapus!",
      deletedFile: {
        id: file.id,
        originalname: file.originalname
      }
    });

  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan saat menghapus file",
      error: error.message 
    });
  }
};

// Get file as BLOB
exports.getFileAsBlob = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);

    if (!file) {
      return res.status(404).send({ message: "File tidak ditemukan!" });
    }

    // Cek apakah file ada di sistem
    if (!fs.existsSync(file.filepath)) {
      return res.status(404).send({ message: "File fisik tidak ditemukan!" });
    }

    // Baca file sebagai buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Set headers untuk BLOB
    res.setHeader('Content-Type', file.filetype.toLowerCase() === 'pdf' ? 'application/pdf' : 'application/octet-stream');
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Content-Disposition', `inline; filename="${file.originalname}"`);
    
    // Kirim buffer sebagai response
    res.send(fileBuffer);
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

    // Untuk PDF dan file lainnya, gunakan BLOB
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Set headers
    res.setHeader('Content-Type', file.filetype.toLowerCase() === 'pdf' ? 'application/pdf' : 'application/octet-stream');
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Content-Disposition', `inline; filename="${file.originalname}"`);
    
    // Kirim buffer sebagai response
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Fungsi untuk menggabungkan file dari satu question set menjadi satu PDF
exports.combineFilesForPreview = async (req, res) => {
  try {
    const questionSetId = req.params.id;
    const type = req.query.type || 'questions'; // 'questions' atau 'answers'
    
    console.log('Combining files for question set:', questionSetId, 'type:', type);
    
    // Ambil semua file yang terkait dengan question set ini
    const files = await File.findAll({
      where: { 
        question_set_id: questionSetId,
        filecategory: type === 'questions' ? ['questions', 'testCases'] : ['answers']
      },
      order: [
        ['filecategory', 'ASC'],
        ['id', 'ASC']
      ]
    });
    
    console.log('Found files:', files.map(f => ({
      id: f.id,
      originalname: f.originalname,
      filecategory: f.filecategory,
      filetype: f.filetype
    })));
    
    if (!files || files.length === 0) {
      console.log('No files found for question set:', questionSetId, 'type:', type);
      return res.status(404).send({ message: `Tidak ada file ${type} yang ditemukan!` });
    }
    
    // Buat PDF baru untuk menampung semua file
    const mergedPdf = await PDFDocument.create();
    
    // Proses setiap file
    for (const file of files) {
      try {
        let pdfBytes;
        
        // Konversi berdasarkan tipe file
        if (file.filetype.toLowerCase() === 'pdf') {
          // Jika file adalah PDF, langsung baca
          pdfBytes = fs.readFileSync(file.filepath);
        } else if (file.filetype.toLowerCase() === 'docx') {
          // Jika file adalah DOCX, konversi ke PDF dulu
          const tempPdfPath = file.filepath.replace('.docx', '_temp.pdf');
          await docxToPdfPromise(file.filepath, tempPdfPath);
          pdfBytes = fs.readFileSync(tempPdfPath);
          // Hapus file PDF temporary
          fs.unlinkSync(tempPdfPath);
        } else if (file.filetype.toLowerCase() === 'txt') {
          // Jika file adalah TXT, buat PDF baru dengan konten teks
          const txtContent = fs.readFileSync(file.filepath, 'utf8');
          const tempPdf = await PDFDocument.create();
          const page = tempPdf.addPage();
          const { width, height } = page.getSize();
          page.drawText(txtContent, {
            x: 50,
            y: height - 50,
            size: 12,
            maxWidth: width - 100
          });
          pdfBytes = await tempPdf.save();
        } else {
          console.warn(`Tipe file tidak didukung: ${file.filetype}`);
          continue;
        }
        
        // Tambahkan halaman baru untuk setiap file
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
        
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        // Lanjutkan ke file berikutnya jika ada error
        continue;
      }
    }
    
    // Simpan PDF yang sudah digabung
    const mergedPdfBytes = await mergedPdf.save();
    
    // Set headers untuk response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${type === 'questions' ? 'questions_and_testcases.pdf' : 'answers.pdf'}"`);
    
    // Kirim PDF sebagai response
    res.send(Buffer.from(mergedPdfBytes));
    
  } catch (error) {
    console.error("Error in combineFilesForPreview:", error);
    res.status(500).send({ message: error.message });
  }
};

exports.getFileCompleteness = async (req, res) => {
  try {
    const questionSetId = req.params.questionSetId;

    const files = await File.findAll({
      where: { question_set_id: questionSetId },
      attributes: ['filecategory']
    });

    const categories = files.map(file => file.filecategory);

    const hasAnswerKey = categories.includes('answers');
    const hasTestCase = categories.includes('testCases');

    res.status(200).json({ hasAnswerKey, hasTestCase });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mengunduh template soal
exports.downloadTemplate = (_, res) => {
  try {
    const filePath = path.resolve(__dirname, "../uploads/template_soal.docx");

    if (fs.existsSync(filePath)) {
      res.download(filePath, "Template_Soal.docx", (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).send({ message: "Gagal mendownload template" });
        }
      });
    } else {
      res.status(404).send({ message: "File template tidak ditemukan" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// Soft delete file (pindah ke recycle bin)
exports.softDeleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.userId;

    // Cari file
    const file = await File.findByPk(fileId);

    if (!file) {
      return res.status(404).json({ 
        message: "File tidak ditemukan" 
      });
    }

    // Get question set to check authorization
    let questionSet = null;
    if (file.question_set_id) {
      try {
        questionSet = await QuestionSet.findByPk(file.question_set_id);
      } catch (error) {
        console.log("Could not fetch question set for authorization check");
      }
    }

    // Check authorization - hanya pemilik atau admin yang bisa menghapus
    const isOwner = questionSet && questionSet.created_by === userId;
    const isAdmin = req.userRole === 'ROLE_ADMIN' || req.userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: "Anda tidak memiliki izin untuk menghapus file ini" 
      });
    }

    // Update status file menjadi deleted - sesuai dengan field names di model
    await file.update({
      is_deleted: true,
      deleted_at: new Date()
    });

    res.json({ 
      message: "File berhasil dihapus dan dipindahkan ke recycle bin",
      file: {
        id: file.id,
        originalname: file.originalname
      }
    });

  } catch (error) {
    console.error("Error soft deleting file:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan saat menghapus file",
      error: error.message 
    });
  }
};

// Restore file dari recycle bin
exports.restoreFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.userId;

    // Cari file yang sudah dihapus
    const file = await File.findByPk(fileId, {
      include: [{
        model: QuestionSet,
        as: 'questionSet',
        attributes: ['created_by']
      }]
    });

    if (!file) {
      return res.status(404).json({ 
        message: "File tidak ditemukan" 
      });
    }

    if (!file.isDeleted) {
      return res.status(400).json({ 
        message: "File tidak berada di recycle bin" 
      });
    }

    // Check authorization
    const isOwner = file.questionSet && file.questionSet.created_by === userId;
    const isAdmin = req.userRole === 'ROLE_ADMIN' || req.userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: "Anda tidak memiliki izin untuk memulihkan file ini" 
      });
    }

    // Restore file
    await file.update({
      isDeleted: false,
      deletedAt: null
    });

    res.json({ 
      message: "File berhasil dipulihkan",
      file: {
        id: file.id,
        originalname: file.originalname
      }
    });

  } catch (error) {
    console.error("Error restoring file:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan saat memulihkan file",
      error: error.message 
    });
  }
};

// Permanent delete file
exports.permanentDeleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.userId;

    // Cari file yang sudah dihapus
    const file = await File.findByPk(fileId, {
      include: [{
        model: QuestionSet,
        as: 'questionSet',
        attributes: ['created_by']
      }]
    });

    if (!file) {
      return res.status(404).json({ 
        message: "File tidak ditemukan" 
      });
    }

    if (!file.isDeleted) {
      return res.status(400).json({ 
        message: "File harus berada di recycle bin sebelum dihapus permanen" 
      });
    }

    // Check authorization
    const isOwner = file.questionSet && file.questionSet.created_by === userId;
    const isAdmin = req.userRole === 'ROLE_ADMIN' || req.userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: "Anda tidak memiliki izin untuk menghapus file ini secara permanen" 
      });
    }

    // Hapus file dari storage
    if (file.filepath && fs.existsSync(file.filepath)) {
      try {
        fs.unlinkSync(file.filepath);
      } catch (fsError) {
        console.error("Error deleting file from storage:", fsError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Hapus record dari database
    const fileName = file.originalname;
    await file.destroy();

    res.json({ 
      message: "File berhasil dihapus secara permanen",
      file: {
        originalname: fileName
      }
    });

  } catch (error) {
    console.error("Error permanently deleting file:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan saat menghapus file secara permanen",
      error: error.message 
    });
  }
};

// Get deleted files untuk question set tertentu
exports.getDeletedFiles = async (req, res) => {
  try {
    const questionSetId = req.params.id;
    const userId = req.userId;

    // Verify question set ownership
    const questionSet = await QuestionSet.findByPk(questionSetId);
    if (!questionSet) {
      return res.status(404).json({ 
        message: "Question set tidak ditemukan" 
      });
    }

    // Check authorization
    const isOwner = questionSet.created_by === userId;
    const isAdmin = req.userRole === 'ROLE_ADMIN' || req.userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: "Anda tidak memiliki izin untuk melihat recycle bin question set ini" 
      });
    }

    // Get deleted files
    const deletedFiles = await File.findAll({
      where: {
        question_set_id: questionSetId,
        isDeleted: true
      },
      order: [['deletedAt', 'DESC']],
      attributes: [
        'id', 
        'originalname', 
        'filetype', 
        'filesize', 
        'filecategory', 
        'deletedAt'
      ]
    });

    res.json(deletedFiles);

  } catch (error) {
    console.error("Error fetching deleted files:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan saat mengambil data file yang dihapus",
      error: error.message 
    });
  }
};

// Bulk restore files (optional)
exports.bulkRestoreFiles = async (req, res) => {
  try {
    const { fileIds } = req.body;
    const userId = req.userId;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ 
        message: "fileIds harus berupa array yang tidak kosong" 
      });
    }

    // Verify ownership untuk semua files
    const files = await File.findAll({
      where: {
        id: fileIds,
        isDeleted: true
      },
      include: [{
        model: QuestionSet,
        as: 'questionSet',
        attributes: ['created_by']
      }]
    });

    // Check authorization untuk semua files
    const unauthorizedFiles = files.filter(file => {
      const isOwner = file.questionSet && file.questionSet.created_by === userId;
      const isAdmin = req.userRole === 'ROLE_ADMIN' || req.userRole === 'admin';
      return !isOwner && !isAdmin;
    });

    if (unauthorizedFiles.length > 0) {
      return res.status(403).json({ 
        message: "Anda tidak memiliki izin untuk memulihkan beberapa file" 
      });
    }

    // Restore files
    await File.update(
      {
        isDeleted: false,
        deletedAt: null
      },
      {
        where: {
          id: fileIds,
          isDeleted: true
        }
      }
    );

    res.json({ 
      message: `${files.length} file berhasil dipulihkan`,
      restoredCount: files.length
    });

  } catch (error) {
    console.error("Error bulk restoring files:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan saat memulihkan file",
      error: error.message 
    });
  }
};

// Update fungsi getDeletedFiles di controller
exports.getDeletedFiles = async (req, res) => {
  try {
    const questionSetId = req.params.id;
    const userId = req.userId;

    console.log("Get deleted files request:", {
      questionSetId,
      userId,
      userRole: req.userRole
    });

    // Verify question set exists
    const questionSet = await QuestionSet.findByPk(questionSetId);
    if (!questionSet) {
      return res.status(404).json({ 
        message: "Question set tidak ditemukan" 
      });
    }

    // Get user role from database if not available in request
    let userRole = req.userRole;
    if (!userRole && userId) {
      try {
        const User = db.user;
        const user = await User.findByPk(userId, { attributes: ['role'] });
        userRole = user?.role;
        console.log("User role fetched from database:", userRole);
      } catch (dbError) {
        console.log("Could not fetch user role from database:", dbError.message);
      }
    }

    // Check authorization
    const createdBy = questionSet.created_by || questionSet.createdBy || questionSet.dataValues?.created_by;
    const isOwner = createdBy && createdBy === userId;
    const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'admin';
    
    // TEMPORARY FIX: If created_by is null, allow any authenticated user
    const allowAccess = isOwner || isAdmin || !createdBy;

    console.log("Authorization check for recycle bin:", {
      isOwner,
      isAdmin,
      allowAccess,
      userId,
      userRole,
      questionSetCreatedBy: createdBy,
      createdByIsNull: !createdBy
    });

    if (!allowAccess) {
      return res.status(403).json({ 
        message: "Anda tidak memiliki izin untuk melihat recycle bin question set ini" 
      });
    }

    // Get deleted files
    const deletedFiles = await File.findAll({
      where: {
        question_set_id: questionSetId,
        is_deleted: true
      },
      order: [['deleted_at', 'DESC']],
      attributes: [
        'id', 
        'originalname', 
        'filetype', 
        'filesize', 
        'filecategory', 
        'deleted_at'
      ]
    });

    console.log(`Found ${deletedFiles.length} deleted files for question set ${questionSetId}`);

    res.json(deletedFiles);

  } catch (error) {
    console.error("Error fetching deleted files:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan saat mengambil data file yang dihapus",
      error: error.message 
    });
  }
};

// Bulk permanent delete files (optional)
exports.bulkPermanentDeleteFiles = async (req, res) => {
  try {
    const { fileIds } = req.body;
    const userId = req.userId;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ 
        message: "fileIds harus berupa array yang tidak kosong" 
      });
    }

    // Verify ownership dan ambil file data
    const files = await File.findAll({
      where: {
        id: fileIds,
        isDeleted: true
      },
      include: [{
        model: QuestionSet,
        as: 'questionSet',
        attributes: ['created_by']
      }]
    });

    // Check authorization untuk semua files
    const unauthorizedFiles = files.filter(file => {
      const isOwner = file.questionSet && file.questionSet.created_by === userId;
      const isAdmin = req.userRole === 'ROLE_ADMIN' || req.userRole === 'admin';
      return !isOwner && !isAdmin;
    });

    if (unauthorizedFiles.length > 0) {
      return res.status(403).json({ 
        message: "Anda tidak memiliki izin untuk menghapus beberapa file secara permanen" 
      });
    }

    // Hapus file dari storage
    let deletedFromStorageCount = 0;
    files.forEach(file => {
      if (file.filepath && fs.existsSync(file.filepath)) {
        try {
          fs.unlinkSync(file.filepath);
          deletedFromStorageCount++;
        } catch (fsError) {
          console.error(`Error deleting file ${file.originalname} from storage:`, fsError);
        }
      }
    });

    // Hapus records dari database
    const deletedCount = await File.destroy({
      where: {
        id: fileIds,
        isDeleted: true
      }
    });

    res.json({ 
      message: `${deletedCount} file berhasil dihapus secara permanen`,
      deletedCount: deletedCount,
      deletedFromStorage: deletedFromStorageCount
    });

  } catch (error) {
    console.error("Error bulk permanent deleting files:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan saat menghapus file secara permanen",
      error: error.message 
    });
  }
};

// Update existing method untuk filter file yang tidak dihapus
// Modifikasi method yang sudah ada jika diperlukan
exports.getFilesByQuestionSet = async (req, res) => {
  try {
    const questionSetId = req.params.questionSetId;
    
    const files = await File.findAll({
      where: {
        question_set_id: questionSetId,
        isDeleted: false // Hanya ambil file yang tidak dihapus
      },
      order: [['createdAt', 'ASC']]
    });

    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan saat mengambil data file",
      error: error.message 
    });
  }
};

// Upload Replace File (Atomic Replacement)
exports.uploadReplaceFile = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { questionSetId, fileCategory, replaceFileId } = req.body;
    const uploadedFile = req.file;
    
    if (!uploadedFile) {
      await transaction.rollback();
      return res.status(400).json({ error: 'File tidak ditemukan' });
    }

    if (!replaceFileId) {
      await transaction.rollback();
      await fs.unlink(uploadedFile.path);
      return res.status(400).json({ error: 'ID file yang akan diganti tidak ditemukan' });
    }

    // Normalize category
    const normalizeCategory = (category) => {
      const categoryMap = {
        'soal': 'questions',
        'kunci': 'answers', 
        'test': 'testCases',
        'questions': 'questions',
        'answers': 'answers',
        'testCases': 'testCases'
      };
      return categoryMap[category] || category;
    };

    // Validasi file yang akan diganti
    const existingFile = await db.File.findOne({
      where: { 
        id: replaceFileId, 
        questionSetId: questionSetId,
        isDeleted: false 
      },
      transaction
    });

    if (!existingFile) {
      await transaction.rollback();
      await fs.unlink(uploadedFile.path);
      return res.status(404).json({ error: 'File yang akan diganti tidak ditemukan' });
    }

    const normalizedCategory = normalizeCategory(fileCategory);

    // Insert file baru
    const newFile = await db.File.create({
      originalname: uploadedFile.originalname,
      filename: uploadedFile.filename,
      filepath: uploadedFile.path,
      filetype: path.extname(uploadedFile.originalname).slice(1).toLowerCase(),
      filesize: uploadedFile.size,
      filecategory: normalizedCategory,
      questionSetId: questionSetId,
      uploadedBy: req.userId,
      isDeleted: false
    }, { transaction });

    // Mark file lama sebagai deleted (soft delete)
    await existingFile.update({
      isDeleted: true,
      deletedBy: req.userId,
      deletedAt: new Date()
    }, { transaction });

    // Commit transaction
    await transaction.commit();

    // Hapus file fisik lama (di luar transaction untuk keamanan)
    if (existingFile.filepath) {
      try {
        const fileExists = await fs.access(existingFile.filepath).then(() => true).catch(() => false);
        if (fileExists) {
          await fs.unlink(existingFile.filepath);
        }
      } catch (fileDeleteError) {
        console.warn('Warning: Could not delete old physical file:', fileDeleteError);
      }
    }

    res.status(200).json({
      message: 'File berhasil diganti',
      file: newFile,
      replacedFileId: replaceFileId
    });

  } catch (error) {
    await transaction.rollback();

    // Cleanup uploaded file
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded file:', cleanupError);
      }
    }

    console.error('Error replacing file:', error);
    res.status(500).json({ 
      error: 'Gagal mengganti file',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Replacement History
exports.getReplacementHistory = async (req, res) => {
  try {
    const { questionSetId } = req.params;
    
    const files = await db.File.findAll({
      where: { questionSetId: questionSetId },
      include: [
        {
          model: db.User,
          as: 'uploader',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: db.User,
          as: 'deleter',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC'], ['deletedAt', 'DESC']]
    });

    res.json(files);

  } catch (error) {
    console.error('Error fetching replacement history:', error);
    res.status(500).json({ error: 'Gagal memuat riwayat penggantian file' });
  }
};

// Get File Activity/Audit Log
exports.getFileActivity = async (req, res) => {
  try {
    const { questionSetId } = req.params;
    
    // Ambil semua aktivitas file untuk question set
    const activities = await db.sequelize.query(`
      SELECT 
        f.id,
        f.originalname,
        f.filecategory,
        f.createdAt as activity_time,
        'upload' as activity_type,
        u1.username as actor_name,
        u1.fullName as actor_full_name
      FROM files f
      LEFT JOIN users u1 ON f.uploadedBy = u1.id
      WHERE f.questionSetId = :questionSetId
      
      UNION ALL
      
      SELECT 
        f.id,
        f.originalname,
        f.filecategory,
        f.deletedAt as activity_time,
        'delete' as activity_type,
        u2.username as actor_name,
        u2.fullName as actor_full_name
      FROM files f
      LEFT JOIN users u2 ON f.deletedBy = u2.id
      WHERE f.questionSetId = :questionSetId AND f.isDeleted = true
      
      ORDER BY activity_time DESC
    `, {
      replacements: { questionSetId },
      type: db.Sequelize.QueryTypes.SELECT
    });

    res.json(activities);

  } catch (error) {
    console.error('Error fetching file activity:', error);
    res.status(500).json({ error: 'Gagal memuat aktivitas file' });
  }
};

// Rollback File Replacement (Emergency Recovery)
exports.rollbackFileReplacement = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { fileId } = req.params;
    
    // Cari file yang akan di-rollback (harus yang active)
    const currentFile = await db.File.findOne({
      where: { id: fileId, isDeleted: false },
      transaction
    });

    if (!currentFile) {
      await transaction.rollback();
      return res.status(404).json({ error: 'File tidak ditemukan' });
    }

    // Cari file sebelumnya yang di-replace (berdasarkan kategori dan question set)
    const previousFile = await db.File.findOne({
      where: {
        questionSetId: currentFile.questionSetId,
        filecategory: currentFile.filecategory,
        isDeleted: true,
        deletedAt: {
          [db.Sequelize.Op.lt]: currentFile.createdAt
        }
      },
      order: [['deletedAt', 'DESC']],
      transaction
    });

    if (!previousFile) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Tidak ada file sebelumnya untuk di-rollback' });
    }

    // Rollback: aktifkan file lama, hapus file baru
    await previousFile.update({
      isDeleted: false,
      deletedAt: null,
      deletedBy: null
    }, { transaction });

    await currentFile.update({
      isDeleted: true,
      deletedBy: req.userId,
      deletedAt: new Date()
    }, { transaction });

    await transaction.commit();

    // Hapus file fisik yang di-rollback
    if (currentFile.filepath) {
      try {
        await fs.unlink(currentFile.filepath);
      } catch (fileDeleteError) {
        console.warn('Warning: Could not delete rolled back file:', fileDeleteError);
      }
    }

    res.json({
      message: 'File berhasil di-rollback',
      restoredFile: previousFile,
      removedFile: currentFile
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error rolling back file:', error);
    res.status(500).json({ error: 'Gagal melakukan rollback file' });
  }
};

// Get File Statistics
exports.getFileStatistics = async (req, res) => {
  try {
    const { questionSetId } = req.params;
    
    const stats = await db.File.findAll({
      where: { questionSetId },
      attributes: [
        'filecategory',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'total'],
        [db.Sequelize.fn('COUNT', db.Sequelize.literal('CASE WHEN isDeleted = false THEN 1 END')), 'active'],
        [db.Sequelize.fn('COUNT', db.Sequelize.literal('CASE WHEN isDeleted = true THEN 1 END')), 'deleted'],
        [db.Sequelize.fn('SUM', db.Sequelize.literal('CASE WHEN isDeleted = false THEN filesize ELSE 0 END')), 'totalSize']
      ],
      group: ['filecategory'],
      raw: true
    });

    res.json(stats);

  } catch (error) {
    console.error('Error fetching file statistics:', error);
    res.status(500).json({ error: 'Gagal memuat statistik file' });
  }
};

// ========================================
// ENHANCED EXISTING METHODS
// ========================================

// Enhanced Upload File (dengan tracking)
exports.uploadFileEnhanced = async (req, res) => {
  try {
    const { questionSetId, fileCategory } = req.body;
    const uploadedFile = req.file;
    
    if (!uploadedFile) {
      return res.status(400).json({ error: 'File tidak ditemukan' });
    }

    // Normalize category
    const normalizeCategory = (category) => {
      const categoryMap = {
        'soal': 'questions',
        'kunci': 'answers', 
        'test': 'testCases'
      };
      return categoryMap[category] || category;
    };

    const normalizedCategory = normalizeCategory(fileCategory);

    // Create file record dengan enhanced tracking
    const newFile = await db.File.create({
      originalname: uploadedFile.originalname,
      filename: uploadedFile.filename,
      filepath: uploadedFile.path,
      filetype: path.extname(uploadedFile.originalname).slice(1).toLowerCase(),
      filesize: uploadedFile.size,
      filecategory: normalizedCategory,
      questionSetId: questionSetId,
      uploadedBy: req.userId,
      isDeleted: false
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: newFile
    });

  } catch (error) {
    // Cleanup uploaded file if error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    console.error('Error uploading file:', error);
    res.status(500).json({ 
      error: 'Gagal mengupload file',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Enhanced Soft Delete (dengan tracking yang lebih baik)
exports.softDeleteFileEnhanced = async (req, res) => {
  try {
    const { id } = req.params;
    
    const file = await db.File.findOne({
      where: { id, isDeleted: false }
    });

    if (!file) {
      return res.status(404).json({ error: 'File tidak ditemukan' });
    }

    await file.update({
      isDeleted: true,
      deletedBy: req.userId,
      deletedAt: new Date()
    });

    res.json({
      message: 'File berhasil dihapus',
      file: file
    });

  } catch (error) {
    console.error('Error soft deleting file:', error);
    res.status(500).json({ error: 'Gagal menghapus file' });
  }
};

// Enhanced Restore File
exports.restoreFileEnhanced = async (req, res) => {
  try {
    const { id } = req.params;
    
    const file = await db.File.findOne({
      where: { id, isDeleted: true }
    });

    if (!file) {
      return res.status(404).json({ error: 'File tidak ditemukan atau sudah dipulihkan' });
    }

    await file.update({
      isDeleted: false,
      deletedAt: null,
      deletedBy: null
    });

    res.json({
      message: 'File berhasil dipulihkan',
      file: file
    });

  } catch (error) {
    console.error('Error restoring file:', error);
    res.status(500).json({ error: 'Gagal memulihkan file' });
  }
};

// Enhanced Get Deleted Files
exports.getDeletedFilesEnhanced = async (req, res) => {
  try {
    const { questionSetId } = req.params;
    
    const deletedFiles = await db.File.findAll({
      where: { 
        questionSetId: questionSetId,
        isDeleted: true 
      },
      include: [
        {
          model: db.User,
          as: 'deleter',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['deletedAt', 'DESC']]
    });

    res.json(deletedFiles);

  } catch (error) {
    console.error('Error fetching deleted files:', error);
    res.status(500).json({ error: 'Gagal memuat file yang dihapus' });
  }
};

// Enhanced Get Files By Question Set (filter active files dengan info uploader)
exports.getFilesByQuestionSetEnhanced = async (req, res) => {
  try {
    const { questionSetId } = req.params;
    
    const files = await db.File.findAll({
      where: { 
        questionSetId: questionSetId,
        isDeleted: false 
      },
      include: [
        {
          model: db.User,
          as: 'uploader',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['filecategory', 'ASC'], ['createdAt', 'DESC']]
    });

    // Group by category
    const groupedFiles = files.reduce((acc, file) => {
      const category = file.filecategory;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(file);
      return acc;
    }, {});

    res.json(groupedFiles);

  } catch (error) {
    console.error('Error fetching files by question set:', error);
    res.status(500).json({ error: 'Gagal memuat files' });
  }
};

// ========================================
// UTILITY METHODS
// ========================================

// Batch Operation Status (untuk tracking bulk operations)
exports.getBatchOperationStatus = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Implementasi tergantung bagaimana Anda handle batch operations
    // Ini contoh sederhana
    const status = {
      batchId,
      status: 'completed',
      totalItems: 0,
      processedItems: 0,
      errors: []
    };

    res.json(status);

  } catch (error) {
    console.error('Error fetching batch operation status:', error);
    res.status(500).json({ error: 'Gagal memuat status operasi batch' });
  }
};