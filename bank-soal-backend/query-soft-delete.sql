-- JALANKAN QUERY INI SATU PER SATU DI DATABASE POSTGRESQL ANDA

-- 1. Tambah kolom untuk tracking upload dan soft delete
ALTER TABLE files ADD COLUMN IF NOT EXISTS uploaded_by INTEGER REFERENCES users(id);
ALTER TABLE files ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id);

-- 2. Update constraint filetype untuk mendukung format tambahan
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_filetype_check;
ALTER TABLE files ADD CONSTRAINT files_filetype_check 
    CHECK (filetype IN ('pdf', 'docx', 'doc', 'txt', 'PDF', 'DOCX', 'DOC', 'TXT'));

-- 3. Update constraint filecategory untuk mendukung nama legacy
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_filecategory_check;
ALTER TABLE files ADD CONSTRAINT files_filecategory_check 
    CHECK (filecategory IN ('questions', 'answers', 'testCases', 'soal', 'kunci', 'test'));

-- 4. Tambah indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_files_not_deleted ON files(question_set_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_files_category_active ON files(filecategory, is_deleted);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_deleted_by ON files(deleted_by);

-- 5. Set uploaded_by untuk file existing (assign ke admin pertama)
UPDATE files 
SET uploaded_by = (SELECT id FROM users WHERE role = 'ROLE_ADMIN' LIMIT 1)
WHERE uploaded_by IS NULL;


select * from files
-- 6. Cek hasil migration
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'files' 
AND column_name IN ('uploaded_by', 'is_deleted', 'deleted_at', 'deleted_by');