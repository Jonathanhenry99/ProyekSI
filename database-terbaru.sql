-- ========================================
-- BANK SOAL INFORMATIKA DATABASE SCHEMA
-- ========================================

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS question_history CASCADE;
DROP TABLE IF EXISTS question_material_tags CASCADE;
DROP TABLE IF EXISTS question_course_tags CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS question_set_items CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS course_material_assignments CASCADE;
DROP TABLE IF EXISTS material_tags CASCADE;
DROP TABLE IF EXISTS course_tags CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
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

-- Courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
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
CREATE TABLE question_sets (
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
    filetype VARCHAR(50) NOT NULL CHECK (filetype IN ('PDF', 'DOCX', 'TXT')),
    filesize INTEGER NOT NULL,
    filecategory VARCHAR(50) NOT NULL CHECK (filecategory IN ('questions', 'answers', 'testCases')),
    question_set_id INTEGER REFERENCES question_sets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL CHECK (difficulty_level IN ('Mudah', 'Sedang', 'Sulit')),
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('Essay', 'Coding', 'Multiple Choice')),
    created_by INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question-Course tags junction table
CREATE TABLE question_course_tags (
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    course_tag_id INTEGER REFERENCES course_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, course_tag_id)
);

-- Question-Material tags junction table
CREATE TABLE question_material_tags (
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    material_tag_id INTEGER REFERENCES material_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, material_tag_id)
);

-- Answers table
CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
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
('Graph'),
('Sorting'),
('Searching'),
('Recursion'),
('Dynamic Programming'),
('SQL'),
('NoSQL'),
('Normalization'),
('HTML'),
('CSS'),
('JavaScript'),
('React'),
('Node.js'),
('Flutter'),
('Android'),
('Machine Learning'),
('Neural Networks');

-- Insert sample question sets
INSERT INTO question_sets (title, description, subject, year, level, lecturer, topics, created_by) VALUES 
('UAS Algoritma Semester 1', 'Ujian Akhir Semester Algoritma dan Pemrograman', 'Algoritma dan Pemrograman', 2023, 'Sedang', 'Dosen 1', 'Array, Sorting, Searching', 1),
('UTS Struktur Data', 'Ujian Tengah Semester Struktur Data', 'Struktur Data', 2023, 'Sulit', 'Dosen 2', 'Linked List, Stack, Queue', 1),
('Quiz Basis Data', 'Quiz Basis Data Dasar', 'Basis Data', 2023, 'Mudah', 'Dosen 3', 'SQL, Normalisasi', 1);

-- ========================================
-- COURSE-MATERIAL ASSIGNMENTS
-- ========================================

-- Algoritma dan Pemrograman assignments
INSERT INTO course_material_assignments (course_tag_id, material_tag_id)
SELECT 
    (SELECT id FROM course_tags WHERE name = 'Algoritma dan Pemrograman'),
    id
FROM material_tags 
WHERE name IN ('Array', 'Linked List', 'Stack', 'Queue', 'Sorting', 'Searching', 'Recursion')
ON CONFLICT DO NOTHING;

-- Struktur Data assignments
INSERT INTO course_material_assignments (course_tag_id, material_tag_id)
SELECT 
    (SELECT id FROM course_tags WHERE name = 'Struktur Data'),
    id
FROM material_tags 
WHERE name IN ('Array', 'Linked List', 'Stack', 'Queue', 'Tree', 'Graph', 'Sorting', 'Searching', 'Dynamic Programming')
ON CONFLICT DO NOTHING;

-- Basis Data assignments
INSERT INTO course_material_assignments (course_tag_id, material_tag_id)
SELECT 
    (SELECT id FROM course_tags WHERE name = 'Basis Data'),
    id
FROM material_tags 
WHERE name IN ('SQL', 'NoSQL', 'Normalization')
ON CONFLICT DO NOTHING;

-- Pemrograman Web assignments
INSERT INTO course_material_assignments (course_tag_id, material_tag_id)
SELECT 
    (SELECT id FROM course_tags WHERE name = 'Pemrograman Web'),
    id
FROM material_tags 
WHERE name IN ('HTML', 'CSS', 'JavaScript', 'React', 'Node.js')
ON CONFLICT DO NOTHING;

-- Pemrograman Mobile assignments
INSERT INTO course_material_assignments (course_tag_id, material_tag_id)
SELECT 
    (SELECT id FROM course_tags WHERE name = 'Pemrograman Mobile'),
    id
FROM material_tags 
WHERE name IN ('Flutter', 'Android', 'JavaScript', 'React')
ON CONFLICT DO NOTHING;

-- Kecerdasan Buatan assignments
INSERT INTO course_material_assignments (course_tag_id, material_tag_id)
SELECT 
    (SELECT id FROM course_tags WHERE name = 'Kecerdasan Buatan'),
    id
FROM material_tags 
WHERE name IN ('Machine Learning', 'Neural Networks', 'Tree', 'Graph', 'Dynamic Programming')
ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify course-material assignments
-- Uncomment to run verification
/*
SELECT 
    ct.name as course_name,
    mt.name as material_name,
    cma.created_at
FROM course_material_assignments cma
JOIN course_tags ct ON cma.course_tag_id = ct.id
JOIN material_tags mt ON cma.material_tag_id = mt.id
ORDER BY ct.name, mt.name;

-- Count statistics
SELECT 
    'Total Users' as metric, COUNT(*) as count FROM users
UNION ALL
SELECT 
    'Total Course Tags' as metric, COUNT(*) as count FROM course_tags
UNION ALL
SELECT 
    'Total Material Tags' as metric, COUNT(*) as count FROM material_tags
UNION ALL
SELECT 
    'Total Assignments' as metric, COUNT(*) as count FROM course_material_assignments
UNION ALL
SELECT 
    'Total Question Sets' as metric, COUNT(*) as count FROM question_sets;
*/