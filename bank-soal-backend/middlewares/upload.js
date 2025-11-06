const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Membuat direktori upload jika belum ada
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ Normalize category untuk folder
    let category = req.body.fileCategory || "questions";
    
    // Handle answers_1, answers_2 -> answers
    if (category.startsWith('answers_')) {
      category = 'answers';
    }
    
    const categoryDir = path.join(uploadDir, category);
    
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    cb(null, categoryDir);
  },
  filename: (req, file, cb) => {
    // Membuat nama file unik dengan timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    
    // Sanitize filename - remove special characters
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    cb(null, sanitizedBaseName + "-" + uniqueSuffix + ext);
  }
});

// ✅ REMOVE FILE FILTER - Validasi dilakukan di controller
// Ini memungkinkan semua file type di-upload, validasi dilakukan di controller

// Konfigurasi multer
const upload = multer({
  storage: storage,
  // ✅ NO fileFilter - let controller handle validation
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB (increased from 10MB)
  }
});

module.exports = upload;