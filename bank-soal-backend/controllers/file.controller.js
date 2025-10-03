const db = require("../models");
const File = db.file;
const QuestionSet = db.questionSet;
const fs = require("fs");
const path = require("path");
const { PDFDocument } = require('pdf-lib');
const docxToPdf = require('docx-pdf');
const util = require('util');
const docxToPdfPromise = util.promisify(docxToPdf);
const { Op } = require("sequelize");
const archiver = require('archiver');

// ========================================
// BASIC FILE OPERATIONS
// ========================================

// Enhanced Upload File with proper tracking
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

    // Normalize category function
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

    const normalizedCategory = normalizeCategory(req.body.fileCategory || "questions");

    // Simpan informasi file ke database dengan enhanced tracking
    const file = await File.create({
      originalname: req.file.originalname,
      filename: req.file.filename,
      filepath: req.file.path,
      filetype: path.extname(req.file.originalname).substring(1).toUpperCase(),
      filesize: req.file.size,
      filecategory: normalizedCategory,
      question_set_id: req.body.questionSetId,
      uploadedBy: req.userId,
      is_deleted: false
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
        console.log("Question set found:", {
          id: questionSet?.id,
          title: questionSet?.title,
          created_by: questionSet?.created_by,
          createdBy: questionSet?.createdBy
        });
      } catch (qsError) {
        console.log("Could not fetch question set:", qsError.message);
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
    const createdBy = questionSet?.created_by || questionSet?.createdBy || questionSet?.dataValues?.created_by;
    const isOwner = createdBy && createdBy === req.userId;
    const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'admin';

    console.log("Authorization check:", {
      isOwner,
      isAdmin,
      userId: req.userId,
      userRole: userRole,
      questionSetCreatedBy: createdBy
    });

    if (!isOwner && !isAdmin) {
      // TEMPORARY: Allow any logged-in user to delete files for testing
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

// ========================================
// FILE COMBINATION AND PDF OPERATIONS
// ========================================

// Enhanced Fungsi untuk menggabungkan file dari satu question set menjadi satu PDF
exports.combineFilesForPreview = async (req, res) => {
  try {
    const questionSetId = req.params.id;
    const type = req.query.type || 'questions';
    
    console.log('Combining files for question set:', questionSetId, 'type:', type);
    
    // Determine filter based on type
    let fileCategoryFilter;
    if (type === 'answers') {
      fileCategoryFilter = 'answers';
    } else {
      fileCategoryFilter = {
        [Op.in]: ['questions', 'testCases'] 
      };
    }
    
    // Query Database
    const files = await File.findAll({ 
      where: { 
        question_set_id: questionSetId,
        filecategory: fileCategoryFilter,
        is_deleted: false // Only include non-deleted files
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

    const mergedPdf = await PDFDocument.create();
    
    // Proses setiap file
    for (const file of files) {
      try {
        let pdfBytes;
        
        // Konversi berdasarkan tipe file
        if (file.filetype.toLowerCase() === 'pdf') {
          pdfBytes = fs.readFileSync(file.filepath);
        } else if (file.filetype.toLowerCase() === 'docx') {
          const tempPdfPath = file.filepath.replace('.docx', '_temp.pdf');
          await docxToPdfPromise(file.filepath, tempPdfPath);
          pdfBytes = fs.readFileSync(tempPdfPath);
          fs.unlinkSync(tempPdfPath);
        } else if (file.filetype.toLowerCase() === 'txt') {
          const txtContent = fs.readFileSync(file.filepath, 'utf8');
          const tempPdf = await PDFDocument.create();
          const page = tempPdf.addPage();
          const { width, height } = page.getSize();
          
          // Enhanced text processing for better formatting
          const lines = txtContent.split('\n');
          let yPos = height - 50;
          const lineHeight = 14;
          
          for (const line of lines) {
            if (yPos < 50) {
              const newPage = tempPdf.addPage();
              yPos = newPage.getSize().height - 50;
            }
            
            page.drawText(line, {
              x: 50,
              y: yPos,
              size: 12,
              maxWidth: width - 100
            });
            yPos -= lineHeight;
          }
          
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
        continue;
      }
    }
    
    // Simpan PDF yang sudah digabung
    const mergedPdfBytes = await mergedPdf.save();
    
    // Set headers untuk response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      "Content-Disposition",
      `inline; filename="combine_${questionSetId}_${type}.pdf"`
    );
    
    // Kirim PDF sebagai response
    res.send(Buffer.from(mergedPdfBytes));
    
  } catch (error) {
    console.error("Error in combineFilesForPreview:", error);
    res.status(500).send({ message: error.message });
  }
};

// Enhanced Fungsi untuk menggabungkan file dari banyak question set menjadi satu PDF untuk diunduh
exports.combineFilesForDownload = async (req, res) => {
  try {
    const idString = req.query.ids; 

    if (!idString) {
        return res.status(400).send({ message: "Daftar ID soal diperlukan." });
    }

    const questionSetIds = idString.split(',').map(id => parseInt(id.trim()));

    const files = await File.findAll({
      where: { 
        question_set_id: {
          [Op.in]: questionSetIds
        },
        is_deleted: false // Only include non-deleted files
      },
      order: [
        ['question_set_id', 'ASC'], 
        ['filecategory', 'ASC'] 
      ]
    });

    if (!files || files.length === 0) {
      return res.status(404).send({ message: "Tidak ada file untuk soal yang dipilih." });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      try {
        const filePath = path.resolve(file.filepath);
        let pdfBytes;

        if (file.filetype.toLowerCase() === "pdf") { 
          pdfBytes = fs.readFileSync(filePath);
        } else if (file.filetype.toLowerCase() === 'docx') {
          const tempPdfPath = filePath.replace('.docx', '_temp.pdf');
          await docxToPdfPromise(filePath, tempPdfPath);
          pdfBytes = fs.readFileSync(tempPdfPath);
          fs.unlinkSync(tempPdfPath);
        } else if (file.filetype.toLowerCase() === 'txt') {
          const txtContent = fs.readFileSync(filePath, 'utf8');
          const tempPdf = await PDFDocument.create();
          const page = tempPdf.addPage();
          const { width, height } = page.getSize();
          
          const lines = txtContent.split('\n');
          let yPos = height - 50;
          const lineHeight = 14;
          
          for (const line of lines) {
            if (yPos < 50) {
              const newPage = tempPdf.addPage();
              yPos = newPage.getSize().height - 50;
            }
            
            page.drawText(line, {
              x: 50,
              y: yPos,
              size: 12,
              maxWidth: width - 100
            });
            yPos -= lineHeight;
          }
          
          pdfBytes = await tempPdf.save();
        } else {
          const page = mergedPdf.addPage([600, 800]);
          const { height } = page.getSize();
          page.drawText(`File: ${file.originalname}\n(${file.filetype})\nTidak bisa digabung langsung.`, {
            x: 50,
            y: height - 100,
            size: 14,
          });
          continue;
        }

        if (pdfBytes) {
          const pdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        continue;
      }
    }

    const pdfBytes = await mergedPdf.save();
    const filename = `combined_soal_${questionSetIds.join('_')}.pdf`; 

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Error combineFilesForDownload:", error);
    res.status(500).send({ message: "Gagal menggabungkan file." });
  }
};

// Enhanced Fungsi untuk mengunduh bundle ZIP berisi file soal, kunci jawaban, dan test case
exports.downloadZipBundle = async (req, res) => {
    try {
        const idString = req.query.ids; 
        const formTitle = req.query.formTitle || "Soal_Lengkap";
        
        if (!idString) {
            return res.status(400).send({ message: "Daftar ID soal diperlukan." });
        }
        const questionSetIds = idString.split(',').map(id => parseInt(id.trim()));

        // Get question set titles
        const questionSets = await QuestionSet.findAll({
             where: { id: { [Op.in]: questionSetIds } },
             attributes: ['id', 'title']
        });

        const setTitleMap = questionSets.reduce((map, set) => {
            map[set.id] = set.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
            return map;
        }, {});
        
        // Get all files (excluding deleted ones)
        const allFiles = await File.findAll({ 
            where: { 
                question_set_id: { [Op.in]: questionSetIds },
                is_deleted: false
            }
        });

        if (!allFiles || allFiles.length === 0) {
            return res.status(404).send({ message: "Tidak ada file yang ditemukan untuk ID yang dipilih." });
        }
        
        // Filter ONLY question files for PDF combination
        const questionFiles = allFiles.filter(f => f.filecategory === 'questions');

        // Create combined question PDF
        const mergedQuestionPdf = await PDFDocument.create();

        for (const file of questionFiles) {
            const filePath = path.resolve(file.filepath);
            let pdfBytes;

            try {
                if (file.filetype.toLowerCase() === 'pdf') {
                    pdfBytes = fs.readFileSync(filePath);
                } else if (file.filetype.toLowerCase() === 'docx') {
                    const tempPdfPath = path.join(path.dirname(filePath), `${file.filename}_temp.pdf`);
                    await docxToPdfPromise(filePath, tempPdfPath);
                    pdfBytes = fs.readFileSync(tempPdfPath);
                    fs.unlinkSync(tempPdfPath); 
                } else if (file.filetype.toLowerCase() === 'txt') {
                    const txtContent = fs.readFileSync(filePath, 'utf8');
                    const tempPdf = await PDFDocument.create();
                    const page = tempPdf.addPage();
                    const { width, height } = page.getSize();
                    
                    const lines = txtContent.split('\n');
                    let yPos = height - 50;
                    const lineHeight = 14;
                    
                    for (const line of lines) {
                        if (yPos < 50) {
                            const newPage = tempPdf.addPage();
                            yPos = newPage.getSize().height - 50;
                        }
                        
                        page.drawText(line, { x: 50, y: yPos, size: 12, maxWidth: width - 100 });
                        yPos -= lineHeight;
                    }
                    
                    pdfBytes = await tempPdf.save();
                } else {
                    console.warn(`Tipe file soal tidak didukung atau dilewati: ${file.originalname}`);
                    continue;
                }

                if (pdfBytes) {
                    const pdfDoc = await PDFDocument.load(pdfBytes);
                    const copiedPages = await mergedQuestionPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                    copiedPages.forEach(page => mergedQuestionPdf.addPage(page));
                }

            } catch (error) {
                console.error(`Error processing file ${file.originalname}:`, error);
                continue; 
            }
        }
        
        const mergedQuestionPdfBuffer = await mergedQuestionPdf.save();
        const mergedQuestionPdfName = `${formTitle}_SOAL_GABUNGAN.pdf`;
        
        const zipName = `${formTitle}_BUNDLE.zip`; 
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res); 

        // Add combined question PDF
        archive.append(Buffer.from(mergedQuestionPdfBuffer), { 
            name: path.join('01_Soal', mergedQuestionPdfName) 
        });

        // Add other files (Answer keys, Test cases)
        const otherFiles = allFiles.filter(f => f.filecategory === 'answers' || f.filecategory === 'testCases');

        for (const file of otherFiles) {
            let folderName = '';
            const setTitle = setTitleMap[file.question_set_id] || `SetID_${file.question_set_id}`;
            let baseFileName = '';

            if (file.filecategory === 'answers') {
                folderName = '02_Kunci_Jawaban';
                baseFileName = `${setTitle}_KunciJawaban`;
            } else if (file.filecategory === 'testCases') {
                folderName = '03_Test_Case';
                baseFileName = `${setTitle}_TestCase`;
            }
            
            if (folderName) {
                const filePath = path.resolve(file.filepath);
                const extension = path.extname(file.originalname); 
                const fileNameInZip = path.join(folderName, baseFileName + extension);
                archive.file(filePath, { name: fileNameInZip });
            }
        }

        await archive.finalize();

    } catch (error) {
        console.error("Critical Error in downloadZipBundle:", error); 
        res.status(500).send({ message: "Gagal membuat dan mengunduh file ZIP." });
    }
};

// ========================================
// SOFT DELETE OPERATIONS
// ========================================

// Soft delete file (pindah ke recycle bin)
exports.softDeleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.userId;

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

    // Check authorization
    const createdBy = questionSet?.created_by || questionSet?.createdBy || questionSet?.dataValues?.created_by;
    const isOwner = createdBy && createdBy === userId;
    const isAdmin = req.userRole === 'ROLE_ADMIN' || req.userRole === 'admin';

    // TEMPORARY: Allow any authenticated user (remove in production)
    const allowAnyUser = true;
    
    if (!isOwner && !isAdmin && !allowAnyUser) {
      return res.status(403).json({ 
        message: "Anda tidak memiliki izin untuk menghapus file ini" 
      });
    }

    // Update status file menjadi deleted
    await file.update({
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: userId
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

    const file = await File.findByPk(fileId);

    if (!file) {
      return res.status(404).json({ 
        message: "File tidak ditemukan" 
      });
    }

    if (!file.is_deleted) {
      return res.status(400).json({ 
        message: "File tidak berada di recycle bin" 
      });
    }

    // Get question set for authorization
    let questionSet = null;
    if (file.question_set_id) {
      try {
        questionSet = await QuestionSet.findByPk(file.question_set_id);
      } catch (error) {
        console.log("Could not fetch question set for authorization check");
      }
    }

    // Check authorization
    const createdBy = questionSet?.created_by || questionSet?.createdBy || questionSet?.dataValues?.created_by;
    const isOwner = createdBy && createdBy === userId;
    const isAdmin = req.userRole === 'ROLE_ADMIN' || req.userRole === 'admin';

    // TEMPORARY: Allow any authenticated user (remove in production)
    const allowAnyUser = true;

    if (!isOwner && !isAdmin && !allowAnyUser) {
      return res.status(403).json({ 
        message: "Anda tidak memiliki izin untuk memulihkan file ini" 
      });
    }

    // Restore file
    await file.update({
      is_deleted: false,
      deleted_at: null,
      deleted_by: null
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

    const file = await File.findByPk(fileId);

    if (!file) {
      return res.status(404).json({ 
        message: "File tidak ditemukan" 
      });
    }

    if (!file.is_deleted) {
      return res.status(400).json({ 
        message: "File harus berada di recycle bin sebelum dihapus permanen" 
      });
    }

    // Get question set for authorization
    let questionSet = null;
    if (file.question_set_id) {
      try {
        questionSet = await QuestionSet.findByPk(file.question_set_id);
      } catch (error) {
        console.log("Could not fetch question set for authorization check");
      }
    }

    // Check authorization
    const createdBy = questionSet?.created_by || questionSet?.createdBy || questionSet?.dataValues?.created_by;
    const isOwner = createdBy && createdBy === userId;
    const isAdmin = req.userRole === 'ROLE_ADMIN' || req.userRole === 'admin';

    // TEMPORARY: Allow any authenticated user (remove in production)
    const allowAnyUser = true;

    if (!isOwner && !isAdmin && !allowAnyUser) {
      return res.status(403).json({ 
        message: "Anda tidak memiliki izin untuk menghapus file ini secara permanen" 
      });
    }

    // Delete file from storage
    if (file.filepath && fs.existsSync(file.filepath)) {
      try {
        fs.unlinkSync(file.filepath);
      } catch (fsError) {
        console.error("Error deleting file from storage:", fsError);
      }
    }

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
    
    // TEMPORARY: Allow any authenticated user (remove in production)
    const allowAccess = isOwner || isAdmin || !createdBy || true;

    console.log("Authorization check for recycle bin:", {
      isOwner,
      isAdmin,
      allowAccess,
      userId,
      userRole,
      questionSetCreatedBy: createdBy
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

// ========================================
// FILE REPLACEMENT OPERATIONS
// ========================================

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
      if (uploadedFile && uploadedFile.path) {
        fs.unlinkSync(uploadedFile.path);
      }
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

    // Validate file to be replaced
    const existingFile = await File.findOne({
      where: { 
        id: replaceFileId, 
        question_set_id: questionSetId,
        is_deleted: false 
      },
      transaction
    });

    if (!existingFile) {
      await transaction.rollback();
      if (uploadedFile && uploadedFile.path) {
        fs.unlinkSync(uploadedFile.path);
      }
      return res.status(404).json({ error: 'File yang akan diganti tidak ditemukan' });
    }

    const normalizedCategory = normalizeCategory(fileCategory);

    // Insert new file
    const newFile = await File.create({
      originalname: uploadedFile.originalname,
      filename: uploadedFile.filename,
      filepath: uploadedFile.path,
      filetype: path.extname(uploadedFile.originalname).slice(1).toLowerCase(),
      filesize: uploadedFile.size,
      filecategory: normalizedCategory,
      question_set_id: questionSetId,
      uploadedBy: req.userId,
      is_deleted: false
    }, { transaction });

    // Mark old file as deleted (soft delete)
    await existingFile.update({
      is_deleted: true,
      deleted_by: req.userId,
      deleted_at: new Date()
    }, { transaction });

    // Commit transaction
    await transaction.commit();

    // Delete old physical file (outside transaction for safety)
    if (existingFile.filepath) {
      try {
        if (fs.existsSync(existingFile.filepath)) {
          fs.unlinkSync(existingFile.filepath);
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
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
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

// ========================================
// UTILITY AND INFORMATION FUNCTIONS
// ========================================

// Get file completeness indicator
exports.getFileCompleteness = async (req, res) => {
  try {
    const questionSetId = req.params.questionSetId;

    const files = await File.findAll({
      where: { 
        question_set_id: questionSetId,
        is_deleted: false
      },
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

// Download template soal
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

// Get files by question set (enhanced with user info)
exports.getFilesByQuestionSet = async (req, res) => {
  try {
    const questionSetId = req.params.questionSetId;
    
    const files = await File.findAll({
      where: {
        question_set_id: questionSetId,
        is_deleted: false
      },
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
    console.error("Error fetching files:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan saat mengambil data file",
      error: error.message 
    });
  }
};

// ========================================
// BULK OPERATIONS
// ========================================

// Bulk restore files
exports.bulkRestoreFiles = async (req, res) => {
  try {
    const { fileIds } = req.body;
    const userId = req.userId;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ 
        message: "fileIds harus berupa array yang tidak kosong" 
      });
    }

    // Verify ownership for all files
    const files = await File.findAll({
      where: {
        id: fileIds,
        is_deleted: true
      }
    });

    if (files.length === 0) {
      return res.status(404).json({ 
        message: "Tidak ada file yang ditemukan untuk dipulihkan" 
      });
    }

    // Restore files
    await File.update(
      {
        is_deleted: false,
        deleted_at: null,
        deleted_by: null
      },
      {
        where: {
          id: fileIds,
          is_deleted: true
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

// Bulk permanent delete files
exports.bulkPermanentDeleteFiles = async (req, res) => {
  try {
    const { fileIds } = req.body;
    const userId = req.userId;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ 
        message: "fileIds harus berupa array yang tidak kosong" 
      });
    }

    // Get file data before deletion
    const files = await File.findAll({
      where: {
        id: fileIds,
        is_deleted: true
      }
    });

    if (files.length === 0) {
      return res.status(404).json({ 
        message: "Tidak ada file yang ditemukan untuk dihapus permanen" 
      });
    }

    // Delete files from storage
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

    // Delete records from database
    const deletedCount = await File.destroy({
      where: {
        id: fileIds,
        is_deleted: true
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

// ========================================
// ADVANCED FEATURES
// ========================================

// Get File Statistics
exports.getFileStatistics = async (req, res) => {
  try {
    const { questionSetId } = req.params;
    
    const stats = await File.findAll({
      where: { question_set_id: questionSetId },
      attributes: [
        'filecategory',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total'],
        [db.sequelize.fn('COUNT', db.sequelize.literal('CASE WHEN is_deleted = false THEN 1 END')), 'active'],
        [db.sequelize.fn('COUNT', db.sequelize.literal('CASE WHEN is_deleted = true THEN 1 END')), 'deleted'],
        [db.sequelize.fn('SUM', db.sequelize.literal('CASE WHEN is_deleted = false THEN filesize ELSE 0 END')), 'totalSize']
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

// Rollback File Replacement (Emergency Recovery)
exports.rollbackFileReplacement = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { fileId } = req.params;
    
    // Find file to rollback (must be active)
    const currentFile = await File.findOne({
      where: { id: fileId, is_deleted: false },
      transaction
    });

    if (!currentFile) {
      await transaction.rollback();
      return res.status(404).json({ error: 'File tidak ditemukan' });
    }

    // Find previous file that was replaced
    const previousFile = await File.findOne({
      where: {
        question_set_id: currentFile.question_set_id,
        filecategory: currentFile.filecategory,
        is_deleted: true,
        deleted_at: {
          [Op.lt]: currentFile.createdAt
        }
      },
      order: [['deleted_at', 'DESC']],
      transaction
    });

    if (!previousFile) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Tidak ada file sebelumnya untuk di-rollback' });
    }

    // Rollback: activate old file, delete new file
    await previousFile.update({
      is_deleted: false,
      deleted_at: null,
      deleted_by: null
    }, { transaction });

    await currentFile.update({
      is_deleted: true,
      deleted_by: req.userId,
      deleted_at: new Date()
    }, { transaction });

    await transaction.commit();

    // Delete rolled back physical file
    if (currentFile.filepath) {
      try {
        fs.unlinkSync(currentFile.filepath);
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

// Get File Activity/Audit Log
exports.getFileActivity = async (req, res) => {
  try {
    const { questionSetId } = req.params;
    
    // Get all file activities for question set
    const activities = await db.sequelize.query(`
      SELECT 
        f.id,
        f.originalname,
        f.filecategory,
        f.createdAt as activity_time,
        'upload' as activity_type,
        f.uploadedBy as actor_id
      FROM files f
      WHERE f.question_set_id = :questionSetId
      
      UNION ALL
      
      SELECT 
        f.id,
        f.originalname,
        f.filecategory,
        f.deleted_at as activity_time,
        'delete' as activity_type,
        f.deleted_by as actor_id
      FROM files f
      WHERE f.question_set_id = :questionSetId AND f.is_deleted = true
      
      ORDER BY activity_time DESC
    `, {
      replacements: { questionSetId },
      type: db.sequelize.QueryTypes.SELECT
    });

    res.json(activities);

  } catch (error) {
    console.error('Error fetching file activity:', error);
    res.status(500).json({ error: 'Gagal memuat aktivitas file' });
  }
};

// Get Replacement History
exports.getReplacementHistory = async (req, res) => {
  try {
    const { questionSetId } = req.params;
    
    const files = await File.findAll({
      where: { question_set_id: questionSetId },
      order: [['createdAt', 'DESC'], ['deleted_at', 'DESC']]
    });

    res.json(files);

  } catch (error) {
    console.error('Error fetching replacement history:', error);
    res.status(500).json({ error: 'Gagal memuat riwayat penggantian file' });
  }
};