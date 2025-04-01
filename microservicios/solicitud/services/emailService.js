const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

async function sendEmail(to, subject, message, isHtml = false) {
    try {
        let mailOptions = {
            from: `"Soporte Técnico" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            ...(isHtml ? { html: message } : { text: message }) // Asegurar formato
        };

        let info = await transporter.sendMail(mailOptions);
        console.log(`✅ Correo enviado: ${info.messageId}`);
    } catch (error) {
        console.error("❌ Error enviando correo:", error);
    }
}

module.exports = sendEmail;
