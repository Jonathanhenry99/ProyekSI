const db = require("../models");
const User = db.user;
const bcrypt = require("bcryptjs");

// [GET] Mengambil semua dosen (role ROLE_USER) - TIDAK ADA PERUBAHAN DI SINI
exports.getAllDosen = async (req, res) => {
    try {
        const dosen = await User.findAll({
            where: { role: 'ROLE_USER' },
            attributes: ['id', 'fullName', 'email', 'isActive'],
            order: [['fullName', 'ASC']]
        });

        const formattedDosen = dosen.map(d => ({
            id: d.id,
            nama: d.fullName,
            email: d.email,
            status: d.isActive ? 'Aktif' : 'Nonaktif'
        }));

        res.status(200).json(formattedDosen);
    } catch (error) {
        console.error("Error fetching all dosen:", error);
        res.status(500).json({ message: "Gagal mengambil daftar dosen.", error: error.message });
    }
};

// [POST] Membuat dosen baru
exports.createDosen = async (req, res) => {
    const { nama, email, password } = req.body;

    // Validasi input dasar
    if (!nama || !email || !password) {
        return res.status(400).json({ message: "Nama, email, dan password wajib diisi." });
    }

    try {
        // Periksa apakah email sudah terdaftar
        const existingEmailUser = await User.findOne({ where: { email: email } });
        if (existingEmailUser) {
            return res.status(409).json({ message: "Email sudah terdaftar." });
        }

        // Periksa apakah username (nama) sudah terdaftar
        const existingUsernameUser = await User.findOne({ where: { username: nama } }); // <-- TAMBAHKAN VALIDASI UNTUK USERNAME
        if (existingUsernameUser) {
            return res.status(409).json({ message: "Nama (username) sudah digunakan. Harap gunakan nama yang unik." }); // <-- PESAN ERROR UNTUK USERNAME
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat user baru dengan role ROLE_USER
        const newDosen = await User.create({
            username: nama, // <-- UBAH INI: Gunakan 'nama' untuk 'username'
            fullName: nama,
            email: email,
            password: hashedPassword,
            role: 'ROLE_USER',
            isActive: true
        });

        // Respon dengan data dosen yang baru dibuat (sesuai format frontend)
        res.status(201).json({
            id: newDosen.id,
            nama: newDosen.fullName,
            email: newDosen.email,
            status: newDosen.isActive ? 'Aktif' : 'Nonaktif'
        });
    } catch (error) {
        console.error("Error creating dosen:", error);
        // Penting: Tangani error yang lebih spesifik jika memungkinkan
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors[0].path;
            const value = error.errors[0].value;
            if (field === 'email') {
                return res.status(409).json({ message: `Email '${value}' sudah terdaftar.` });
            } else if (field === 'username') {
                return res.status(409).json({ message: `Nama (username) '${value}' sudah digunakan. Harap gunakan nama yang unik.` });
            }
        }
        res.status(500).json({ message: "Gagal membuat dosen baru.", error: error.message });
    }
};

// [PUT] Memperbarui data dosen yang sudah ada
exports.updateDosen = async (req, res) => {
    const { id } = req.params;
    const { nama, email, password } = req.body;

    // Validasi input dasar
    if (!nama || !email) {
        return res.status(400).json({ message: "Nama dan email wajib diisi untuk pembaruan." });
    }

    try {
        // Cari dosen berdasarkan ID dan role
        const dosenToUpdate = await User.findOne({
            where: { id: id, role: 'ROLE_USER' }
        });

        if (!dosenToUpdate) {
            return res.status(404).json({ message: "Dosen tidak ditemukan atau bukan ROLE_USER." });
        }

        // Periksa jika email baru sudah digunakan oleh user lain (selain user yang sedang diupdate)
        if (email !== dosenToUpdate.email) {
            const existingEmailUser = await User.findOne({ where: { email: email } });
            if (existingEmailUser && existingEmailUser.id !== dosenToUpdate.id) { // Pastikan bukan user yang sama
                return res.status(409).json({ message: "Email sudah digunakan oleh pengguna lain." });
            }
        }

        // Periksa jika username (nama) baru sudah digunakan oleh user lain (selain user yang sedang diupdate)
        if (nama !== dosenToUpdate.fullName) { // Membandingkan nama baru dengan nama lama (yang juga username lama)
            const existingUsernameUser = await User.findOne({ where: { username: nama } });
            if (existingUsernameUser && existingUsernameUser.id !== dosenToUpdate.id) { // Pastikan bukan user yang sama
                return res.status(409).json({ message: "Nama (username) sudah digunakan oleh pengguna lain. Harap gunakan nama yang unik." });
            }
        }

        // Update atribut
        dosenToUpdate.fullName = nama;
        dosenToUpdate.email = email;
        dosenToUpdate.username = nama; // <-- UBAH INI: Pastikan username juga terupdate dengan nama baru

        // Jika ada password baru, hash dan update
        if (password) {
            dosenToUpdate.password = await bcrypt.hash(password, 10);
        }

        await dosenToUpdate.save(); // Simpan perubahan ke database

        // Respon dengan data dosen yang diperbarui (sesuai format frontend)
        res.status(200).json({
            id: dosenToUpdate.id,
            nama: dosenToUpdate.fullName,
            email: dosenToUpdate.email,
            status: dosenToUpdate.isActive ? 'Aktif' : 'Nonaktif'
        });
    } catch (error) {
        console.error(`Error updating dosen with ID ${id}:`, error);
        // Tangani error unik constraint
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors[0].path;
            const value = error.errors[0].value;
            if (field === 'email') {
                return res.status(409).json({ message: `Email '${value}' sudah terdaftar.` });
            } else if (field === 'username') {
                return res.status(409).json({ message: `Nama (username) '${value}' sudah digunakan. Harap gunakan nama yang unik.` });
            }
        }
        res.status(500).json({ message: "Gagal memperbarui data dosen.", error: error.message });
    }
};

// [DELETE] Menghapus dosen - TIDAK ADA PERUBAHAN DI SINI
exports.deleteDosen = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await User.destroy({
            where: { id: id, role: 'ROLE_USER' }
        });

        if (result === 0) {
            return res.status(404).json({ message: "Dosen tidak ditemukan atau bukan ROLE_USER." });
        }
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting dosen with ID ${id}:`, error);
        res.status(500).json({ message: "Gagal menghapus dosen.", error: error.message });
    }
};