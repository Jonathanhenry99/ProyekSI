const nodemailer = require('nodemailer');
require('dotenv').config();

// Konfigurasi transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // atau service email lain seperti 'outlook', 'yahoo'
    auth: {
        user: process.env.EMAIL_USER, // Email Anda
        pass: process.env.EMAIL_PASSWORD // App password (bukan password biasa)
    }
});

/**
 * Mengirim email reset password
 * @param {string} email - Email penerima
 * @param {string} resetToken - Token reset password
 * @param {string} userName - Nama user
 */
const sendResetPasswordEmail = async (email, resetToken, userName) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
        from: `"Bank Soal Informatika" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Password - Bank Soal Informatika',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .content {
                        background-color: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #3b82f6;
                    }
                    .header h1 {
                        color: #3b82f6;
                        margin: 0;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        margin: 20px 0;
                        background-color: #3b82f6;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    }
                    .button:hover {
                        background-color: #2563eb;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 12px;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="content">
                        <div class="header">
                            <h1>🔐 Reset Password</h1>
                        </div>
                        
                        <p>Halo <strong>${userName}</strong>,</p>
                        
                        <p>Kami menerima permintaan untuk mereset password akun Anda di Bank Soal Informatika.</p>
                        
                        <p>Klik tombol di bawah ini untuk mereset password Anda:</p>
                        
                        <div style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </div>
                        
                        <p>Atau copy dan paste link berikut ke browser Anda:</p>
                        <p style="word-break: break-all; background-color: #f4f4f4; padding: 10px; border-radius: 5px;">
                            ${resetUrl}
                        </p>
                        
                        <div class="warning">
                            <strong>⚠️ Penting:</strong>
                            <ul style="margin: 10px 0;">
                                <li>Link ini akan kedaluwarsa dalam <strong>1 jam</strong></li>
                                <li>Link hanya dapat digunakan <strong>satu kali</strong></li>
                                <li>Jika Anda tidak meminta reset password, abaikan email ini</li>
                            </ul>
                        </div>
                        
                        <p>Jika Anda mengalami kesulitan, silakan hubungi administrator.</p>
                        
                        <div class="footer">
                            <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
                            <p>&copy; 2024 Bank Soal Informatika - Universitas Katolik Parahyangan</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return { success: true, message: 'Email berhasil dikirim' };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Gagal mengirim email: ' + error.message);
    }
};

/**
 * Verifikasi konfigurasi email
 */
const verifyEmailConfig = async () => {
    try {
        await transporter.verify();
        console.log('✅ Email configuration is valid');
        return true;
    } catch (error) {
        console.error('❌ Email configuration error:', error);
        return false;
    }
};

module.exports = {
    sendResetPasswordEmail,
    verifyEmailConfig
};
