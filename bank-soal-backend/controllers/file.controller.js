const db = require("../models");
const File = db.file;
const fs = require("fs");
const path = require("path");
const { PDFDocument } = require('pdf-lib');
const docxToPdf = require('docx-pdf');
const util = require('util');
const docxToPdfPromise = util.promisify(docxToPdf);
const PDFMerger = require('pdf-merger-js'); // pastikan install: npm i pdf-merger-js
const { Op } = require("sequelize");
const archiver = require('archiver');
const QuestionSet = db.questionSet;

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

    const type = req.query.type; 

    // 2. Tentukan filter berdasarkan 'type'
    let fileCategoryFilter;
    if (type === 'answers') {
        // Jika type adalah 'answers', ambil HANYA kategori 'answers'
        fileCategoryFilter = 'answers';
    } else {
        // Default (questions): Ambil 'questions' dan 'testCases', kecuali 'answers'
        // Kita gunakan Op.in untuk memilih kategori yang boleh ditampilkan
        fileCategoryFilter = {
            [Op.in]: ['questions', 'testCases'] 
        };
    }
    
    // 3. Query Database
    const files = await File.findAll({ 
      where: { 
        question_set_id: questionSetId,
        filecategory: fileCategoryFilter // Gunakan filter yang sudah ditentukan
      },
      order: [
        ['filecategory', 'ASC'] 
      ]
    });

    if (!files || files.length === 0) {
      return res.status(404).send({ message: "Tidak ada file untuk digabungkan." });
    }

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
    res.setHeader(
      "Content-Disposition",
      `inline; filename="combine_${questionSetId}.pdf"`
    );

    
    // Kirim PDF sebagai response
    res.send(Buffer.from(mergedPdfBytes));
    
  } catch (error) {
    console.error("Error in combineFilesForPreview:", error);
    res.status(500).send({ message: error.message });
  }
};

// Fungsi untuk mendapatkan indikator kelengkapan soal berdasarkan questionSetId
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

// Fungsi untuk menggabungkan file dari banyak question set menjadi satu PDF untuk diunduh
exports.combineFilesForDownload = async (req, res) => {
  try {
    // GANTI: Ambil daftar ID dari query parameter 'ids'
    const idString = req.query.ids; 

    if (!idString) {
        // Ini akan menangani 400 Bad Request jika 'ids' tidak ada
        return res.status(400).send({ message: "Daftar ID soal diperlukan." });
    }

    // Ubah string ID ("1,2,3") menjadi array integer [1, 2, 3]
    const questionSetIds = idString.split(',').map(id => parseInt(id.trim()));

    // GANTI: Ambil semua file yang memiliki question_set_id DI DALAM DAFTAR ID tersebut
    const files = await File.findAll({
      where: { 
        question_set_id: {
          [Op.in]: questionSetIds // Operator IN untuk mencari banyak ID
        } 
      },
      // Opsional: Urutkan untuk menjaga urutan soal
      order: [
        ['question_set_id', 'ASC'], 
        ['filecategory', 'ASC'] 
      ]
    });

    if (!files || files.length === 0) {
      return res.status(404).send({ message: "Tidak ada file untuk soal yang dipilih." });
    }

    // Buat dokumen PDF baru
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const filePath = path.resolve(file.filepath);

      // Pastikan perbandingan tipe file menggunakan toLowerCase()
      if (file.filetype.toLowerCase() === "pdf") { 
        const pdfBytes = fs.readFileSync(filePath);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      } else {
        // Logika untuk non-PDF
        const page = mergedPdf.addPage([600, 800]);
        const { height } = page.getSize();
        page.drawText(`File: ${file.originalname}\n(${file.filetype})\nTidak bisa digabung langsung.`, {
          x: 50,
          y: height - 100,
          size: 14,
        });
      }
    }

    // Export hasil gabungan
    const pdfBytes = await mergedPdf.save();
    // Gunakan semua ID dalam nama file agar unik
    const filename = `combined_soal_${questionSetIds.join('_')}.pdf`; 

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Error combineFilesForDownload:", error);
    res.status(500).send({ message: "Gagal menggabungkan file." });
  }
};

// Fungsi untuk mengunduh bundle ZIP berisi file soal, kunci jawaban, dan test case
exports.downloadZipBundle = async (req, res) => {
    try {
        const idString = req.query.ids; 
        const formTitle = req.query.formTitle || "Soal_Lengkap";
        
        if (!idString) {
            return res.status(400).send({ message: "Daftar ID soal diperlukan." });
        }
        const questionSetIds = idString.split(',').map(id => parseInt(id.trim()));

        // --- Perbaikan: Ambil Judul Set Soal secara terpisah (Hindari masalah JOIN) ---
        // (Pastikan model QuestionSet sudah diimpor, misal: const QuestionSet = db.questionSet;)
        const questionSets = await QuestionSet.findAll({
             where: { id: { [Op.in]: questionSetIds } },
             attributes: ['id', 'title']
        });

        // Buat map judul soal: { 1: "Judul Set 1", 2: "Judul Set 2", ... }
        const setTitleMap = questionSets.reduce((map, set) => {
            // Bersihkan judul dari karakter aneh
            map[set.id] = set.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
            return map;
        }, {});
        // --- Akhir Perbaikan Database ---

        
        // 1. Ambil SEMUA file (TANPA JOIN)
        const allFiles = await File.findAll({ 
            where: { 
                question_set_id: { [Op.in]: questionSetIds }
            }
            // Hapus include di sini: Anda tidak perlu lagi.
        });

        if (!allFiles || allFiles.length === 0) {
            return res.status(404).send({ message: "Tidak ada file yang ditemukan untuk ID yang dipilih." });
        }
        
        // --- LOGIKA GABUNGAN PDF SOAL (Tetap sama) ---

        // Filter HANYA file Soal (questions)
        const questionFiles = allFiles.filter(f => f.filecategory === 'questions');

        // Buat PDF Gabungan Soal
        const mergedQuestionPdf = await PDFDocument.create();

        for (const file of questionFiles) {
            const filePath = path.resolve(file.filepath);
            let pdfBytes; // Variabel untuk menyimpan bytes PDF hasil konversi/baca

            try {
                if (file.filetype.toLowerCase() === 'pdf') {
                    // 1. FILE ASLI SUDAH PDF
                    pdfBytes = fs.readFileSync(filePath);
                    
                } else if (file.filetype.toLowerCase() === 'docx') {
                    // 2. KONVERSI DOCX KE PDF
                    const tempPdfPath = path.join(path.dirname(filePath), `${file.filename}_temp.pdf`);
                    
                    // Konversi DOCX ke PDF menggunakan docxToPdfPromise
                    await docxToPdfPromise(filePath, tempPdfPath);
                    pdfBytes = fs.readFileSync(tempPdfPath);
                    
                    // Hapus file PDF sementara
                    fs.unlinkSync(tempPdfPath); 
                    
                } else if (file.filetype.toLowerCase() === 'txt') {
                    // 3. KONVERSI TXT KE PDF
                    const txtContent = fs.readFileSync(filePath, 'utf8');
                    
                    // Buat dokumen PDF virtual dari teks
                    const tempPdf = await PDFDocument.create();
                    const page = tempPdf.addPage();
                    const { width, height } = page.getSize();
                    
                    // Tulis teks ke PDF. Perlu logika pemecahan baris yang lebih kompleks
                    // Untuk sementara, kita tulis langsung, batas maksimal 100 karakter per baris
                    const lines = txtContent.match(/.{1,100}/g) || []; 
                    
                    let yPos = height - 50;
                    const lineHeight = 14;
                    
                    for (const line of lines) {
                        if (yPos < 50) { // Cek batas bawah halaman
                            const newPage = tempPdf.addPage();
                            yPos = newPage.getSize().height - 50;
                        }
                        
                        page.drawText(line, { x: 50, y: yPos, size: 12 });
                        yPos -= lineHeight;
                    }
                    
                    pdfBytes = await tempPdf.save();
                } else {
                    console.warn(`Tipe file soal tidak didukung atau dilewati: ${file.originalname}`);
                    continue; // Lanjut ke file berikutnya
                }

                // Gabungkan PDF hasil konversi/baca ke dokumen utama
                if (pdfBytes) {
                    const pdfDoc = await PDFDocument.load(pdfBytes);
                    const copiedPages = await mergedQuestionPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                    copiedPages.forEach(page => mergedQuestionPdf.addPage(page));
                }

            } catch (error) {
                console.error(`Error processing file ${file.originalname}:`, error);
                // Lanjutkan ke file berikutnya meskipun gagal
                continue; 
            }
        }
        const mergedQuestionPdfBuffer = await mergedQuestionPdf.save();
        const mergedQuestionPdfName = `${formTitle}_SOAL_GABUNGAN.pdf`;
        
        // --- LOGIKA ARCHIVER (Tetap sama) ---
        
        const zipName = `${formTitle}_BUNDLE.zip`; 
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res); 

        // 3. Tambahkan PDF Gabungan Soal
        archive.append(Buffer.from(mergedQuestionPdfBuffer), { 
            name: path.join('01_Soal', mergedQuestionPdfName) 
        });


        // 4. Tambahkan file lainnya (Kunci Jawaban, Test Case)
        const otherFiles = allFiles.filter(f => f.filecategory === 'answers' || f.filecategory === 'testCases');

        for (const file of otherFiles) {
            let folderName = '';
            
            // Ambil Judul Set Soal individual DARI MAP
            const setTitle = setTitleMap[file.question_set_id] || `SetID_${file.question_set_id}`; // Fallback jika ID tidak ditemukan

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

                // Tambahkan file ke ZIP
                archive.file(filePath, { name: fileNameInZip });
            }
        }

        // 5. Finalisasi
        await archive.finalize();

    } catch (error) {
        // Log error di konsol server
        console.error("Critical Error in downloadZipBundle:", error); 
        res.status(500).send({ message: "Gagal membuat dan mengunduh file ZIP." });
    }
};