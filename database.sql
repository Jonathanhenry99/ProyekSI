-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS question_history CASCADE;
DROP TABLE IF EXISTS question_material_tags CASCADE;
DROP TABLE IF EXISTS question_course_tags CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS question_set_items CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS material_tags CASCADE;
DROP TABLE IF EXISTS course_tags CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS question_sets CASCADE;

-- Tabel untuk menyimpan data pengguna
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

-- Tabel untuk menyimpan mata kuliah
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan tag mata kuliah
CREATE TABLE course_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan tag materi
CREATE TABLE material_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan kumpulan soal
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

-- Tabel untuk menyimpan file
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

-- Tabel untuk menyimpan soal individual
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

-- Tabel untuk relasi many-to-many antara questions dan course_tags
CREATE TABLE question_course_tags (
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    course_tag_id INTEGER REFERENCES course_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, course_tag_id)
);

-- Tabel untuk relasi many-to-many antara questions dan material_tags
CREATE TABLE question_material_tags (
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    material_tag_id INTEGER REFERENCES material_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, material_tag_id)
);

-- Tabel untuk menyimpan jawaban soal
CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan history penggunaan soal
CREATE TABLE question_history (
    id SERIAL PRIMARY KEY,
    question_set_id INTEGER REFERENCES question_sets(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('view', 'download', 'edit', 'delete')),
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_id INTEGER REFERENCES files(id) ON DELETE SET NULL
);

-- Insert admin users
INSERT INTO users (id, username, email, password, full_name, role, is_active) VALUES 
(1, 'admin', 'admin@example.com', '$2a$08$mR4MU5esBbUd6JWuwFKwUeVFjYF6Zx3zYJhPpYJ5YQJ3YJ5YQJ3YJ', 'Administrator', 'ROLE_ADMIN', TRUE),
(2, 'admin1', 'admin1@example.com', '$2a$08$mR4MU5esBbUd6JWuwFKwUeVFjYF6Zx3zYJhPpYJ5YQJ3YJ5YQJ3YJ', 'Administrator 2', 'ROLE_ADMIN', TRUE),
(3, 'admin2', 'admin2@example.com', '$2a$08$vV8m5zFdU7ZvP5aG7b8Y/.8YQZxZxZxZxZxZxZxZxZxZxZxZxZx', 'Administrator 3', 'ROLE_ADMIN', TRUE);

-- Memasukkan beberapa data awal untuk testing
INSERT INTO course_tags (name) VALUES 
('Algoritma dan Pemrograman'),
('Struktur Data'),
('Basis Data'),
('Pemrograman Web'),
('Pemrograman Mobile');

INSERT INTO material_tags (name) VALUES 
('Array'),
('Linked List'),
('Stack'),
('Queue'),
('Tree'),
('Graph'),
('Sorting'),
('Searching'),
('SQL'),
('NoSQL'),
('HTML'),
('CSS'),
('JavaScript'),
('React'),
('Node.js'),
('Flutter'),
('Android');

-- Memasukkan beberapa question set untuk testing
INSERT INTO question_sets (title, description, subject, year, level, lecturer, topics, created_by) VALUES 
('UAS Algoritma Semester 1', 'Ujian Akhir Semester Algoritma dan Pemrograman', 'Algoritma dan Pemrograman', 2023, 'Sedang', 'Dosen 1', 'Array, Sorting, Searching', 1),
('UTS Struktur Data', 'Ujian Tengah Semester Struktur Data', 'Struktur Data', 2023, 'Sulit', 'Dosen 2', 'Linked List, Stack, Queue', 1),
('Quiz Basis Data', 'Quiz Basis Data Dasar', 'Basis Data', 2023, 'Mudah', 'Dosen 3', 'SQL, Normalisasi', 1);


UPDATE users 
SET password = '$2a$08$mR4MU5esBbUd6JWuwFKwUeVFjYF6Zx3zYJhPpYJ5YQJ3YJ5YQJ3YJ' 
WHERE email = 'admin1@example.com';

INSERT INTO users (username, email, password, full_name, role, is_active) 
VALUES ('jonathan', 'jonathan@example.com', '$2a$08$mR4MU5esBbUd6JWuwFKwUeVFjYF6Zx3zYJhPpYJ5YQJ3YJ5YQJ3YJ', 'Jonathan', 'ROLE_USER', TRUE);

-- Membuat indeks untuk optimasi query
CREATE INDEX idx_files_question_set_id ON files(question_set_id);
CREATE INDEX idx_files_filecategory ON files(filecategory);
CREATE INDEX idx_question_sets_created_by ON question_sets(created_by);
CREATE INDEX idx_question_history_user_id ON question_history(user_id);
CREATE INDEX idx_question_history_question_set_id ON question_history(question_set_id);