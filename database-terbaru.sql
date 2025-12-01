-- ========================================
-- BANK SOAL INFORMATIKA DATABASE SCHEMA
-- ========================================

-- Drop existing tables if they exist (in reverse order of dependencies) yang kepake cuman ini
DROP TABLE IF EXISTS question_history CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS question_set_items CASCADE;
DROP TABLE IF EXISTS course_material_assignments CASCADE;
DROP TABLE IF EXISTS material_tags CASCADE;
DROP TABLE IF EXISTS course_tags CASCADE
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS question_sets CASCADE;


-- ========================================
-- CORE TABLES
-- ========================================

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER' CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course tags table
CREATE TABLE course_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Material tags table
CREATE TABLE material_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course-Material assignments junction table
CREATE TABLE course_material_assignments (
    id SERIAL PRIMARY KEY,
    course_tag_id INTEGER NOT NULL REFERENCES course_tags(id) ON DELETE CASCADE,
    material_tag_id INTEGER NOT NULL REFERENCES material_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_tag_id, material_tag_id)
);

-- Question sets table
CREATE TABLE question_sets ( --ini untuk tabel soal individu
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(255) NOT NULL,
    year INTEGER,
    level VARCHAR(50) CHECK (level IN ('Mudah', 'Sedang', 'Sulit')),
    lecturer VARCHAR(255),
    topics TEXT,
    downloads INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Files table
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    originalname VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    -- ✅ Constraint filetype yang lebih fleksibel - mendukung semua ekstensi yang digunakan
    -- Questions: PDF, DOCX, DOC
    -- Answers: Semua bahasa pemrograman (JS, JSX, TS, TSX, PY, JAVA, C, CPP, CC, CXX, H, HPP, CS, PHP, RB, GO, RS, KT, KTS, SWIFT, DART, SCALA, R, M, SH, BASH, SQL, HTML, HTM, CSS, SCSS, SASS, JSON, XML, YAML, YML, TXT)
    -- TestCases: TXT, ZIP, RAR
    filetype VARCHAR(50) NOT NULL CHECK (filetype IN (
        'PDF', 'DOCX', 'DOC',  -- Questions
        'JS', 'JSX', 'TS', 'TSX', 'PY', 'JAVA', 'C', 'CPP', 'CC', 'CXX', 'H', 'HPP', 'CS', 'PHP', 'RB', 'GO', 'RS', 'KT', 'KTS', 'SWIFT', 'DART', 'SCALA', 'R', 'M', 'SH', 'BASH', 'SQL', 'HTML', 'HTM', 'CSS', 'SCSS', 'SASS', 'JSON', 'XML', 'YAML', 'YML', 'TXT',  -- Answers
        'ZIP', 'RAR'  -- TestCases
    )),
    filesize INTEGER NOT NULL,
    -- ✅ Constraint filecategory yang lebih fleksibel - mendukung nilai normal dan legacy
    filecategory VARCHAR(50) NOT NULL CHECK (filecategory IN ('questions', 'answers', 'testCases', 'soal', 'kunci', 'test')),
    question_set_id INTEGER REFERENCES question_sets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Question history table
CREATE TABLE question_history (
    id SERIAL PRIMARY KEY,
    question_set_id INTEGER REFERENCES question_sets(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('view', 'download', 'edit', 'delete')),
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_id INTEGER REFERENCES files(id) ON DELETE SET NULL
);


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


-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Files indexes
CREATE INDEX idx_files_question_set_id ON files(question_set_id);
CREATE INDEX idx_files_filecategory ON files(filecategory);

-- Question sets indexes
CREATE INDEX idx_question_sets_created_by ON question_sets(created_by);
CREATE INDEX idx_question_sets_subject ON question_sets(subject);
CREATE INDEX idx_question_sets_level ON question_sets(level);

-- Course material assignments indexes
CREATE INDEX idx_course_material_assignments_course ON course_material_assignments(course_tag_id);
CREATE INDEX idx_course_material_assignments_material ON course_material_assignments(material_tag_id);

-- Question history indexes
CREATE INDEX idx_question_history_user_id ON question_history(user_id);
CREATE INDEX idx_question_history_question_set_id ON question_history(question_set_id);
CREATE INDEX idx_question_history_action_type ON question_history(action_type);

-- Questions indexes
CREATE INDEX idx_questions_created_by ON questions(created_by);
CREATE INDEX idx_questions_course_id ON questions(course_id);
CREATE INDEX idx_questions_difficulty_level ON questions(difficulty_level);

-- ========================================
-- TRIGGERS AND FUNCTIONS
-- ========================================

-- Function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON courses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_tags_updated_at 
    BEFORE UPDATE ON course_tags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_material_tags_updated_at 
    BEFORE UPDATE ON material_tags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_material_assignments_updated_at 
    BEFORE UPDATE ON course_material_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_sets_updated_at 
    BEFORE UPDATE ON question_sets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at 
    BEFORE UPDATE ON files 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at 
    BEFORE UPDATE ON questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at 
    BEFORE UPDATE ON answers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INITIAL DATA
-- ========================================

-- Insert admin users
INSERT INTO users (username, email, password, full_name, role, is_active) VALUES 
('admin', 'admin@example.com', '$2a$08$mR4MU5esBbUd6JWuwFKwUeVFjYF6Zx3zYJhPpYJ5YQJ3YJ5YQJ3YJ', 'Administrator', 'ROLE_ADMIN', TRUE),
('admin1', 'admin1@example.com', '$2a$08$mR4MU5esBbUd6JWuwFKwUeVFjYF6Zx3zYJhPpYJ5YQJ3YJ5YQJ3YJ', 'Administrator 2', 'ROLE_ADMIN', TRUE),
('admin2', 'admin2@example.com', '$2a$08$vV8m5zFdU7ZvP5aG7b8Y/.8YQZxZxZxZxZxZxZxZxZxZxZxZxZxZxZx', 'Administrator 3', 'ROLE_ADMIN', TRUE),
('jonathan', 'jonathan@example.com', '$2a$08$mR4MU5esBbUd6JWuwFKwUeVFjYF6Zx3zYJhPpYJ5YQJ3YJ5YQJ3YJ', 'Jonathan', 'ROLE_USER', TRUE);

-- Insert course tags
INSERT INTO course_tags (name) VALUES 
('Algoritma dan Pemrograman'),
('Dasar Pemrograman'),
('Desain dan Analisis Pemrograman'),
('Algoritma dan Struktur Data'),;

-- Insert material tags
INSERT INTO material_tags (name) VALUES 
('Array'),
('Linked List'),
('Stack'),
('Queue'),
('Tree'),
('Binary Tree'),
('Binary Search Tree'),
('Graph'),
('Graph Search'),
('Sorting'),
('Searching'),
('Recursion'),
('Dynamic Programming'),
('Hashing'),
('Backtracking'),
('Greedy'),
('Branching'),
('Looping'),
('Merge Sort'),
('Quick Sort'),
('Count Sort'),
('Radix Sort'),
('Heap'),
('Exhaustive Search'),
('Divide and Conquer');


-- Insert sample question sets
INSERT INTO question_sets (title, description, subject, year, level, lecturer, topics, created_by) VALUES 
('UAS Algoritma Semester 1', 'Ujian Akhir Semester Algoritma dan Pemrograman', 'Algoritma dan Pemrograman', 2023, 'Sedang', 'Dosen 1', 'Array, Sorting, Searching', 1),
('UTS Struktur Data', 'Ujian Tengah Semester Struktur Data', 'Struktur Data', 2023, 'Sulit', 'Dosen 2', 'Linked List, Stack, Queue', 1),
('Quiz Basis Data', 'Quiz Basis Data Dasar', 'Basis Data', 2023, 'Mudah', 'Dosen 3', 'SQL, Normalisasi', 1);

-- ========================================
-- COURSE-MATERIAL ASSIGNMENTS
-- ========================================

