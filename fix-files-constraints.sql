-- ========================================
-- FIX FILES TABLE CONSTRAINTS
-- ========================================
-- File ini memperbaiki constraint yang terlalu ketat di tabel files
-- Jalankan file ini setelah import database schema untuk menghindari error saat upload file

-- 1. Hapus constraint lama yang terlalu ketat
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_filetype_check;
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_filecategory_check;

-- 2. Buat constraint baru yang lebih fleksibel untuk filetype
-- Mendukung semua ekstensi file yang digunakan di aplikasi
-- Questions: PDF, DOCX, DOC
-- Answers: Semua bahasa pemrograman (JS, JSX, TS, TSX, PY, JAVA, C, CPP, CC, CXX, H, HPP, CS, PHP, RB, GO, RS, KT, KTS, SWIFT, DART, SCALA, R, M, SH, BASH, SQL, HTML, HTM, CSS, SCSS, SASS, JSON, XML, YAML, YML, TXT)
-- TestCases: TXT, ZIP, RAR
ALTER TABLE files ADD CONSTRAINT files_filetype_check 
    CHECK (filetype IN (
        'PDF', 'DOCX', 'DOC',  -- Questions
        'JS', 'JSX', 'TS', 'TSX', 'PY', 'JAVA', 'C', 'CPP', 'CC', 'CXX', 'H', 'HPP', 'CS', 'PHP', 'RB', 'GO', 'RS', 'KT', 'KTS', 'SWIFT', 'DART', 'SCALA', 'R', 'M', 'SH', 'BASH', 'SQL', 'HTML', 'HTM', 'CSS', 'SCSS', 'SASS', 'JSON', 'XML', 'YAML', 'YML', 'TXT',  -- Answers
        'ZIP', 'RAR'  -- TestCases
    ));

-- 3. Buat constraint baru yang lebih fleksibel untuk filecategory
-- Mendukung nilai normal dan legacy (akan dinormalisasi di controller)
ALTER TABLE files ADD CONSTRAINT files_filecategory_check 
    CHECK (filecategory IN ('questions', 'answers', 'testCases', 'soal', 'kunci', 'test'));

-- ========================================
-- CATATAN:
-- ========================================
-- - Constraint filetype sekarang mendukung semua ekstensi yang digunakan di aplikasi
-- - Constraint filecategory mendukung nilai normal dan legacy (akan dinormalisasi di controller)
-- - Jika masih ada error, pastikan semua nilai di tabel files sesuai dengan constraint baru

