/**
 * ===============================================================
 * Nombre del archivo : emailService.js
 * Autores            : Abraham Eduardo Quintana García, Cristian Eduardo Arreola Valenzuela
 * Descripción        : Establece los métodos necesarios para poder enviar correos.
 * Última modificación: 2025-05-12
 * ===============================================================
 */

const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Método que obtiene la información del archivo de ambiente para poder crear un correo.
 */
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

/**
 * Envía un correo con contenido HTML o texto plano y permite adjuntar archivos.
 * @param {string} to - Destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} message - Cuerpo del mensaje (HTML o texto)
 * @param {boolean} isHtml - Define si el mensaje es HTML
 * @param {Array} attachments - Lista de archivos adjuntos (opcional)
 */
async function sendEmail(to, subject, message, isHtml = false, attachments = []) {
    try {
        const mailOptions = {
            from: `"Soporte Técnico" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            ...(isHtml ? { html: message } : { text: message }),
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Correo enviado: ${info.messageId}`);
    } catch (error) {
        console.error("❌ Error enviando correo:", error);
    }
}

module.exports = sendEmail;
