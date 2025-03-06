const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // Servidor SMTP (por ejemplo, smtp.gmail.com)
    port: process.env.EMAIL_PORT, // 465 (SSL) o 587 (TLS)
    secure: process.env.EMAIL_SECURE === "true", // true para SSL, false para TLS
    auth: {
        user: process.env.EMAIL_USER, // Tu correo
        pass: process.env.EMAIL_PASS, // Tu contraseña o App Password
    },
    tls: {
        rejectUnauthorized: false, // 🚨 Permite certificados autofirmados
    },
});

// Función para enviar correo
async function sendEmail(to, subject, text) {
    try {
        let info = await transporter.sendMail({
            from: `"Soporte Técnico" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });
        console.log(`✅ Correo enviado: ${info.messageId}`);
    } catch (error) {
        console.error("❌ Error enviando correo:", error);
    }
}

module.exports = sendEmail;
