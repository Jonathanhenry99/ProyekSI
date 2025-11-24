const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ========================================
// EMAIL CONFIGURATION
// ========================================

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Atau gunakan SMTP lain
  auth: {
    user: process.env.EMAIL_USER, // Email Anda
    pass: process.env.EMAIL_PASSWORD // App Password (bukan password biasa)
  }
});

// Email template untuk reset password
const getResetPasswordTemplate = (resetLink, userName) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
      .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
      .content { padding: 40px 30px; }
      .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
      .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🔐 Reset Password</h1>
        <p>Bank Soal Informatika UNPAR</p>
      </div>
      <div class="content">
        <h2>Halo${userName ? ' ' + userName : ''}!</h2>
        <p>Kami menerima permintaan untuk mereset password akun Anda di Bank Soal Informatika.</p>
        <p>Klik tombol di bawah ini untuk membuat password baru:</p>
        <div style="text-align: center;">
          <a href="${resetLink}" class="button">Reset Password</a>
        </div>
        <div class="info-box">
          <strong>⏰ Penting:</strong>
          <ul style="margin: 10px 0;">
            <li>Link ini hanya berlaku selama <strong>1 jam</strong></li>
            <li>Link hanya dapat digunakan <strong>satu kali</strong></li>
            <li>Jika Anda tidak meminta reset password, abaikan email ini</li>
          </ul>
        </div>
        <p>Jika tombol di atas tidak berfungsi, copy dan paste link berikut ke browser Anda:</p>
        <p style="word-break: break-all; color: #667eea; font-size: 12px;">${resetLink}</p>
      </div>
      <div class="footer">
        <p>Email ini dikirim secara otomatis dari sistem Bank Soal Informatika UNPAR</p>
        <p>© ${new Date().getFullYear()} Bank Soal Informatika - Universitas Katolik Parahyangan</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

// ========================================
// EXISTING SIGNIN FUNCTION
// ========================================

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

// ========================================
// PASSWORD RESET FUNCTIONS (NEW)
// ========================================

/**
 * Request password reset - Send email with reset link
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).send({
        success: false,
        message: 'Email harus diisi'
      });
    }

    // Find user by email (case insensitive)
    const user = await User.findOne({
      where: {
        email: { [Op.iLike]: email }
      }
    });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'Email tidak terdaftar dalam sistem'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).send({
        success: false,
        message: 'Akun telah dinonaktifkan. Hubungi administrator.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store token in user record
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiresAt;
    await user.save();

    // Generate reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${hashedToken}&id=${user.id}`;

    // Send email
    const mailOptions = {
      from: {
        name: 'Bank Soal Informatika UNPAR',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Reset Password - Bank Soal Informatika',
      html: getResetPasswordTemplate(resetLink, user.fullName)
    };

    await transporter.sendMail(mailOptions);

    console.log(`Password reset email sent to: ${email}`);

    res.status(200).send({
      success: true,
      message: 'Link reset password telah dikirim ke email Anda'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).send({
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi.'
    });
  }
};

/**
 * Validate reset token
 * POST /api/auth/validate-reset-token
 */
exports.validateResetToken = async (req, res) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).send({
        success: false,
        message: 'Token dan User ID harus diisi'
      });
    }

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Check if token matches
    if (user.resetPasswordToken !== token) {
      return res.status(400).send({
        success: false,
        message: 'Token tidak valid atau sudah digunakan'
      });
    }

    // Check if token has expired
    if (!user.resetPasswordExpires || new Date() > new Date(user.resetPasswordExpires)) {
      // Clear expired token
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.status(410).send({
        success: false,
        message: 'Token telah kadaluarsa'
      });
    }

    res.status(200).send({
      success: true,
      message: 'Token valid'
    });

  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).send({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, userId, newPassword } = req.body;

    // Validate inputs
    if (!token || !userId || !newPassword) {
      return res.status(400).send({
        success: false,
        message: 'Semua field harus diisi'
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).send({
        success: false,
        message: 'Password minimal 8 karakter'
      });
    }

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Check if token matches
    if (user.resetPasswordToken !== token) {
      return res.status(400).send({
        success: false,
        message: 'Token tidak valid atau sudah digunakan'
      });
    }

    // Check if token has expired
    if (!user.resetPasswordExpires || new Date() > new Date(user.resetPasswordExpires)) {
      // Clear expired token
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.status(410).send({
        success: false,
        message: 'Token telah kadaluarsa'
      });
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 8);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    console.log(`Password successfully reset for user: ${user.email}`);

    // Send confirmation email (optional)
    try {
      const confirmationMailOptions = {
        from: {
          name: 'Bank Soal Informatika UNPAR',
          address: process.env.EMAIL_USER
        },
        to: user.email,
        subject: 'Password Berhasil Diubah - Bank Soal Informatika',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Berhasil Diubah</h2>
            <p>Halo ${user.fullName || user.username},</p>
            <p>Password Anda telah berhasil diubah pada ${new Date().toLocaleString('id-ID')}.</p>
            <p>Jika Anda tidak melakukan perubahan ini, segera hubungi administrator.</p>
            <hr>
            <p style="font-size: 12px; color: #666;">© ${new Date().getFullYear()} Bank Soal Informatika UNPAR</p>
          </div>
        `
      };

      await transporter.sendMail(confirmationMailOptions);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue anyway - password was changed successfully
    }

    res.status(200).send({
      success: true,
      message: 'Password berhasil direset'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).send({
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi.'
    });
  }
};

// ========================================
// DEBUG FUNCTIONS
// ========================================

// Debug endpoint to check database status
exports.checkDatabase = async (req, res) => {
  try {
    // Check users table
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'password', 'role', 'isActive', 'resetPasswordToken', 'resetPasswordExpires']
    });

    res.status(200).send({
      message: "Database check successful",
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password.substring(0, 10) + "...", // Only show part of password
        role: user.role,
        isActive: user.isActive,
        hasResetToken: !!user.resetPasswordToken,
        resetTokenExpires: user.resetPasswordExpires
      }))
    });
  } catch (error) {
    console.error("Error checking database:", error);
    res.status(500).send({ message: error.message });
  }
};