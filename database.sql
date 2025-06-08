

-- Tabel untuk menyimpan peran pengguna (admin, dosen)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan data pengguna
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    department VARCHAR(100),
    profile_picture VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk relasi many-to-many antara users dan roles
CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
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

-- Tabel untuk menyimpan soal
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL, -- Mudah, Sedang, Sulit
    question_type VARCHAR(50) NOT NULL, -- Essay, Coding, dll
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

-- Tabel untuk menyimpan kumpulan soal
-- Tabel untuk menyimpan kumpulan soal
CREATE TABLE question_sets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(255) NOT NULL,
    year INTEGER,
    level VARCHAR(50),
    lecturer VARCHAR(255),
    topics TEXT,
    downloads INTEGER DEFAULT 0,
    lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk relasi many-to-many antara question_sets dan questions dengan urutan
CREATE TABLE question_set_items (
    question_set_id INTEGER REFERENCES question_sets(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    order_number INTEGER NOT NULL,
    PRIMARY KEY (question_set_id, question_id)
);

-- Tabel untuk menyimpan history penggunaan soal
CREATE TABLE question_history (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- view, download, edit, delete
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Memasukkan data awal untuk roles
INSERT INTO roles (name) VALUES ('ROLE_ADMIN');
INSERT INTO roles (name) VALUES ('ROLE_DOSEN');

-- Memasukkan data awal untuk admin (password harus di-hash pada implementasi sebenarnya)
INSERT INTO users (username, email, password, full_name, is_active) 
VALUES ('admin', 'admin@example.com', 'admin123', 'Administrator', TRUE);

-- Menetapkan peran admin
INSERT INTO user_roles (user_id, role_id) 
VALUES (1, 1);

select * 
from users

-- Gunakan password yang sudah di-hash dengan bcrypt
UPDATE users SET password = 'admin123' WHERE email = 'admin@example.com';


-- Tabel untuk menyimpan file
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    originalname VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    filetype VARCHAR(50) NOT NULL,
    filesize INTEGER NOT NULL,
    filecategory VARCHAR(50) NOT NULL,
    question_set_id INTEGER REFERENCES question_sets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);