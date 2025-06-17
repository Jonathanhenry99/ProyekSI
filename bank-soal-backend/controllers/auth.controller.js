const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signin = async (req, res) => {
  try {
    // Cari user berdasarkan email (case insensitive)
    const user = await User.findOne({
      where: {
        email: { [Op.iLike]: req.body.email }
      }
    });

    if (!user) {
      return res.status(404).send({ message: "Email tidak ditemukan." });
    }

    // Periksa apakah user aktif
    if (!user.isActive) {
      return res.status(403).send({ 
        message: "Akun telah dinonaktifkan, hubungi administrator." 
      });
    }

    // Dalam fungsi signin
    // Tambahkan log sebelum verifikasi password
    console.log("User found:", {
      id: user.id,
      email: user.email,
      role: user.role,
      passwordInDB: user.password.substring(0, 10) + "..." // Hanya tampilkan sebagian untuk keamanan
    });
    console.log("Password from request:", req.body.password);
    
    // Verifikasi password
    let passwordIsValid = false;
    
    // Cek apakah password di database sudah di-hash (dimulai dengan $2a$, $2b$, atau $2y$ untuk bcrypt)
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
      // Password sudah di-hash, gunakan bcrypt untuk verifikasi
      passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    } else {
      // Password masih plaintext, bandingkan langsung
      passwordIsValid = (req.body.password === user.password);
      
      // Opsional: Otomatis hash password plaintext setelah login berhasil
      if (passwordIsValid) {
        user.password = bcrypt.hashSync(user.password, 8);
        await user.save();
        console.log("Password telah otomatis di-hash untuk keamanan");
      }
    }
    
    console.log("Password verification result:", passwordIsValid);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Password salah!"
      });
    }

    // Generate token JWT
    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.jwtExpiration || 86400 // Default ke 24 jam jika tidak ada konfigurasi
    });

    // Ambil role user langsung dari kolom role
    let authorities = [];
    if (user.role) {
      authorities.push(user.role);
    }

    // Kirim respons dengan data user dan token
    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      department: user.department,
      roles: authorities,
      accessToken: token
    });
  } catch (error) {
    console.error("Error in signin:", error);
    res.status(500).send({ message: error.message });
  }
};

// Debug endpoint to check database status
exports.checkDatabase = async (req, res) => {
  try {
    // Check users table
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'password', 'role', 'is_active']
    });

    res.status(200).send({
      message: "Database check successful",
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password.substring(0, 10) + "...", // Only show part of password
        role: user.role,
        is_active: user.is_active
      }))
    });
  } catch (error) {
    console.error("Error checking database:", error);
    res.status(500).send({ message: error.message });
  }
};