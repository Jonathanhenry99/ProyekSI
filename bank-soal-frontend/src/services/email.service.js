// services/email.service.js

const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Configure email transporter
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Atau gunakan SMTP lain
            auth: {
                user: process.env.EMAIL_USER, // Email Anda
                pass: process.env.EMAIL_PASSWORD // App Password (bukan password biasa)
            }
        });

        // Atau gunakan SMTP custom:
        /*
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true, // true untuk port 465, false untuk port lainnya
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
        */
    }

    /**
     * Generate HTML template for password reset email
     */
    getResetPasswordTemplate(resetLink, userName) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Password - Bank Soal Informatika</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: white;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 40px 30px;
                }
                .content h2 {
                    color: #667eea;
                    margin-top: 0;
                }
                .button {
                    display: inline-block;
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white !important;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .button:hover {
                    opacity: 0.9;
                }
                .info-box {
                    background: #f8f9fa;
                    border-left: 4px solid #667eea;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }
                .link-text {
                    word-break: break-all;
                    color: #667eea;
                    font-size: 12px;
                    margin-top: 10px;
                }
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
                    <div class="link-text">
                        ${resetLink}
                    </div>
                    
                    <p style="margin-top: 30px; color: #666; font-size: 14px;">
                        <strong>Catatan Keamanan:</strong><br>
                        • Jangan bagikan link ini kepada siapapun<br>
                        • Gunakan password yang kuat dan unik<br>
                        • Hubungi admin jika Anda mencurigai aktivitas mencurigakan
                    </p>
                </div>
                
                <div class="footer">
                    <p>Email ini dikirim secara otomatis dari sistem Bank Soal Informatika UNPAR</p>
                    <p>© ${new Date().getFullYear()} Bank Soal Informatika - Universitas Katolik Parahyangan</p>
                    <p style="margin-top: 10px;">
                        <a href="mailto:support@banksoal.unpar.ac.id" style="color: #667eea;">Hubungi Support</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email, resetLink, userName = null) {
        try {
            const mailOptions = {
                from: {
                    name: 'Bank Soal Informatika UNPAR',
                    address: process.env.EMAIL_USER
                },
                to: email,
                subject: 'Reset Password - Bank Soal Informatika',
                html: this.getResetPasswordTemplate(resetLink, userName)
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Password reset email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error('Gagal mengirim email reset password');
        }
    }

    /**
     * Send password change confirmation email
     */
    async sendPasswordChangedEmail(email, userName = null) {
        const template = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 40px 30px; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Password Berhasil Diubah</h1>
                </div>
                <div class="content">
                    <h2>Halo${userName ? ' ' + userName : ''}!</h2>
                    <p>Password Anda telah berhasil diubah pada ${new Date().toLocaleString('id-ID')}.</p>
                    <p>Jika Anda tidak melakukan perubahan ini, segera hubungi administrator.</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Bank Soal Informatika UNPAR</p>
                </div>
            </div>
        </body>
        </html>
        `;

        try {
            const mailOptions = {
                from: {
                    name: 'Bank Soal Informatika UNPAR',
                    address: process.env.EMAIL_USER
                },
                to: email,
                subject: 'Password Berhasil Diubah - Bank Soal Informatika',
                html: template
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Password changed confirmation email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending confirmation email:', error);
            // Don't throw error here, just log it
            return { success: false, error: error.message };
        }
    }

    /**
     * Verify email configuration
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email service is ready to send emails');
            return true;
        } catch (error) {
            console.error('❌ Email service configuration error:', error);
            return false;
        }
    }
}

module.exports = new EmailService();