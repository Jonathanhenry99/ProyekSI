

SET client_encoding = 'UTF8';
SET standard_conforming_strings = 'on';
SELECT pg_catalog.set_config('search_path', '', false);


    WITH TEMPLATE = template0 
    ENCODING = 'UTF8' 
    LOCALE_PROVIDER = libc 
    LOCALE = 'English_United States.1252';



CREATE TYPE public.user_role AS ENUM (
    'admin',
    'dosen',
    'mahasiswa'
);




CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role public.user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public.dosen_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    nip VARCHAR(20) NOT NULL UNIQUE,
    nama_lengkap VARCHAR(255) NOT NULL,
    departemen VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public.mahasiswa_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    nim VARCHAR(10) NOT NULL UNIQUE,
    nama_lengkap VARCHAR(255) NOT NULL,
    angkatan VARCHAR(4) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public.course_name (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(255) NOT NULL,
    sks INTEGER NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public.courses (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(255) NOT NULL,
    sks INTEGER NOT NULL,
    dosen_id INTEGER REFERENCES public.users(id),
    semester VARCHAR(50),
    tahun_ajaran VARCHAR(20),
    deskripsi TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    course_name_id INTEGER REFERENCES public.course_name(id)
);


CREATE TABLE public.classes (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    dosen_id INTEGER REFERENCES public.users(id),
    nama VARCHAR(100) NOT NULL,
    kode VARCHAR(20),
    kapasitas INTEGER DEFAULT 40,
    ruangan VARCHAR(50),
    jadwal VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public.class_enrollments (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    mahasiswa_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active',
    nilai_akhir NUMERIC(5,2),
    enrolled_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, mahasiswa_id)
);


CREATE TABLE public.mata_kuliah (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(10) NOT NULL UNIQUE,
    nama VARCHAR(255) NOT NULL,
    semester VARCHAR(6) NOT NULL,
    tahun_ajaran VARCHAR(9) NOT NULL,
    dosen_id INTEGER REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public.tugas_besar (
    id SERIAL PRIMARY KEY,
    mata_kuliah_id INTEGER REFERENCES public.mata_kuliah(id) ON DELETE CASCADE,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.kelompok (
    id SERIAL PRIMARY KEY,
    tugas_besar_id INTEGER REFERENCES public.tugas_besar(id) ON DELETE CASCADE,
    nama_kelompok VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.anggota_kelompok (
    id SERIAL PRIMARY KEY,
    kelompok_id INTEGER REFERENCES public.kelompok(id) ON DELETE CASCADE,
    mahasiswa_id INTEGER REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public.komponen_penilaian (
    id SERIAL PRIMARY KEY,
    tugas_besar_id INTEGER REFERENCES public.tugas_besar(id) ON DELETE CASCADE,
    nama VARCHAR(100) NOT NULL,
    bobot NUMERIC(5,2) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public.nilai (
    id SERIAL PRIMARY KEY,
    komponen_id INTEGER REFERENCES public.komponen_penilaian(id) ON DELETE CASCADE,
    mahasiswa_id INTEGER REFERENCES public.users(id),
    nilai NUMERIC(5,2) NOT NULL,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


SELECT pg_catalog.setval('public.anggota_kelompok_id_seq', 1, false);
SELECT pg_catalog.setval('public.class_enrollments_id_seq', 50, true);
SELECT pg_catalog.setval('public.classes_id_seq', 6, true);
SELECT pg_catalog.setval('public.course_name_id_seq', 7, true);
SELECT pg_catalog.setval('public.courses_id_seq', 11, true);
SELECT pg_catalog.setval('public.dosen_profiles_id_seq', 8, true);
SELECT pg_catalog.setval('public.kelompok_id_seq', 1, false);
SELECT pg_catalog.setval('public.komponen_penilaian_id_seq', 1, false);
SELECT pg_catalog.setval('public.mahasiswa_profiles_id_seq', 15, true);
SELECT pg_catalog.setval('public.mata_kuliah_id_seq', 1, false);
SELECT pg_catalog.setval('public.nilai_id_seq', 1, false);
SELECT pg_catalog.setval('public.tugas_besar_id_seq', 1, false);
SELECT pg_catalog.setval('public.users_id_seq', 29, true);

