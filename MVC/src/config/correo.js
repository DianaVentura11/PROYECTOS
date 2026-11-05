
import nodemailer from "nodemailer";

// Configurar la conexión con Gmail
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verificar la conexión con Gmail
export const verificarCorreo = async () => {
    try {
        await transporter.verify();
        console.log("Conexión SMTP con Gmail exitosa");
    } catch (error) {
        console.error("Error de conexión SMTP:", error.message);
    }
};

// Enviar un correo electrónico
export const enviarCorreo = async (destinatario, asunto, texto, html) => {
    return await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: destinatario,
        subject: asunto,
        text: texto,
        html: html
    });
};
