# Fix Database Constraints untuk Tabel Files

## Masalah
Saat clone project dan import database ke PostgreSQL, terjadi error saat upload file karena constraint di tabel `files` terlalu ketat. Constraint hanya mengizinkan:
- `filetype`: 'PDF', 'DOCX', 'TXT'
- `filecategory`: 'questions', 'answers', 'testCases'

Padahal aplikasi mendukung banyak ekstensi file lainnya (JS, JAVA, PY, ZIP, RAR, dll).

## Solusi

### Opsi 1: Menggunakan File Fix (Recommended)
Jika database sudah terlanjur dibuat dengan constraint lama, jalankan file `fix-files-constraints.sql`:

```bash
psql -U your_username -d your_database -f fix-files-constraints.sql
```

Atau melalui psql:
```sql
\i fix-files-constraints.sql
```

### Opsi 2: Menggunakan Schema yang Sudah Diperbaiki
File `database-terbaru.sql` dan `database.sql` sudah diperbaiki dengan constraint yang lebih fleksibel. Gunakan file ini untuk membuat database baru.

## Constraint Baru

### Filetype
Sekarang mendukung semua ekstensi yang digunakan di aplikasi:
- **Questions**: PDF, DOCX, DOC
- **Answers**: JS, JSX, TS, TSX, PY, JAVA, C, CPP, CC, CXX, H, HPP, CS, PHP, RB, GO, RS, KT, KTS, SWIFT, DART, SCALA, R, M, SH, BASH, SQL, HTML, HTM, CSS, SCSS, SASS, JSON, XML, YAML, YML, TXT
- **TestCases**: TXT, ZIP, RAR

### Filecategory
Mendukung nilai normal dan legacy:
- Normal: 'questions', 'answers', 'testCases'
- Legacy: 'soal', 'kunci', 'test' (akan dinormalisasi di controller)

## Verifikasi
Setelah menjalankan fix, verifikasi constraint sudah berubah:

```sql
-- Cek constraint filetype
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'files'::regclass 
AND conname = 'files_filetype_check';

-- Cek constraint filecategory
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'files'::regclass 
AND conname = 'files_filecategory_check';
```

## Catatan
- File `fix-files-constraints.sql` aman dijalankan berkali-kali (menggunakan `DROP CONSTRAINT IF EXISTS`)
- Jika masih ada error, pastikan semua data di tabel `files` sesuai dengan constraint baru
- Untuk database baru, gunakan `database-terbaru.sql` atau `database.sql` yang sudah diperbaiki

