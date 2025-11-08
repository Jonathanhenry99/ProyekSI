const db = require("../models");
const File = db.file;
const PaketSoal = db.paketSoal;
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

// Fungsi untuk menggabungkan file dari beberapa question set menjadi satu PDF dan menyimpannya
exports.combineMultipleQuestionSets = async (req, res) => {
  try {
    const { questionSetIds, title, description, subject, year, level, lecturer } = req.body;
    
    if (!questionSetIds || !Array.isArray(questionSetIds) || questionSetIds.length < 2) {
      return res.status(400).send({ message: "Minimal 2 set soal diperlukan untuk digabungkan!" });
    }
    
    console.log('Combining multiple question sets:', questionSetIds);
    
    // Buat PDF baru untuk menampung semua file
    const mergedPdf = await PDFDocument.create();
    
    // Proses setiap question set
    for (const questionSetId of questionSetIds) {
      // Ambil semua file questions dari question set ini
      const files = await File.findAll({
        where: { 
          question_set_id: questionSetId,
          filecategory: 'questions'
        },
        order: [['id', 'ASC']]
      });
      
      if (!files || files.length === 0) {
        console.log('No files found for question set:', questionSetId);
        continue; // Lanjutkan ke question set berikutnya
      }
      
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
    }
    
    // Simpan PDF yang sudah digabung
    const mergedPdfBytes = await mergedPdf.save();
    
    // Buat nama file unik untuk PDF gabungan
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const combinedFilename = `combined-${timestamp}-${randomString}.pdf`;
    const combinedFilepath = path.join(__dirname, '../uploads/questions/', combinedFilename);
    
    // Tulis file PDF ke disk
    fs.writeFileSync(combinedFilepath, Buffer.from(mergedPdfBytes));
    
    // Simpan informasi file ke database
    const combinedFile = await File.create({
      originalname: `${title}.pdf`,
      filename: combinedFilename,
      filepath: combinedFilepath,
      filetype: 'PDF',
      filesize: Buffer.from(mergedPdfBytes).length,
      filecategory: 'questions',
      question_set_id: null // Tidak terkait dengan question set tertentu
    });
    
    // Buat paket soal baru untuk file gabungan
    const paketSoal = await PaketSoal.create({
      title,
      description,
      subject,
      year,
      level,
      lecturer,
      topics: JSON.stringify(['Gabungan']),
      downloads: 0,
      lastUpdated: new Date()
    });
    
    // Update file dengan paket soal baru
    await combinedFile.update({ question_set_id: paketSoal.id });
    
    // Set headers untuk response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);
    
    // Kirim PDF sebagai response
    res.send(Buffer.from(mergedPdfBytes));
    
  } catch (error) {
    console.error("Error in combineMultipleQuestionSets:", error);
    res.status(500).send({ message: error.message });
  }
};

// Download file
exports.download = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }

    const filePath = path.join(__dirname, '../uploads/questions/', file.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ message: "File not found on server" });
    }

    // Set proper headers
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error("Error in download:", err);
    res.status(500).send({
      message: `Error downloading file: ${err.message}`
    });
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