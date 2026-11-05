
import Usuario from "../models/usuario.js";
import Actividad from "../models/actividad.js";
import { enviarCorreo } from "../config/correo.js";

// ENVIAR ACTIVIDADES PENDIENTES POR CORREO
export const enviarPendientes = async (req, res) => {
    try {

        // Obtener el usuario que inició sesión
        const usuarioId = req.session.usuarioId;

        if (!usuarioId) {
            return res.redirect("/login");
        }

        // Buscar al usuario en MongoDB
        const usuario = await Usuario.findById(usuarioId);

        if (!usuario || !usuario.correo) {
            return res.status(404).send(
                "No se encontró el correo del usuario."
            );
        }

        // Buscar solamente sus actividades pendientes
        const actividades = await Actividad.find({
            usuario: usuarioId,
            estado: false
        }).sort({ createdAt: 1 }).lean();

        // Comprobar si tiene actividades pendientes
        if (actividades.length === 0) {
            return res.status(200).send(
                "No tienes actividades pendientes para enviar."
            );
        }

        // Crear el contenido en texto plano
        const listaTexto = actividades.map((actividad, indice) =>
            `${indice + 1}. ${actividad.nombre}\n` +
            `Descripción: ${actividad.descripcion}`
        ).join("\n\n");

        const texto =
            `Hola, ${usuario.nombre}.\n\n` +
            `Estas son tus actividades pendientes:\n\n` +
            listaTexto +
            `\n\nSaludos,\nAgenda de actividades`;

        // Escapar caracteres especiales para HTML
        const escaparHTML = (valor) =>
            String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[caracter]));

        // Crear el contenido en HTML
        const listaHTML = actividades.map((actividad) => `
            <li>
                <strong>${escaparHTML(actividad.nombre)}</strong>
                <p>${escaparHTML(actividad.descripcion)}</p>
            </li>
        `).join("");

        const html = `
            <h2>Agenda de actividades</h2>
            <p>Hola, ${escaparHTML(usuario.nombre)}.</p>
            <p>Estas son tus actividades pendientes:</p>
            <ol>${listaHTML}</ol>
            <p>Saludos,<br>Agenda de actividades</p>
        `;

        // Enviar el correo
        await enviarCorreo(
            usuario.correo,
            "Mis actividades pendientes",
            texto,
            html
        );

        res.status(200).send(
            `Las actividades pendientes se enviaron correctamente a ${usuario.correo}.`
        );

    } catch (error) {

        console.error("Error al enviar pendientes:", error);

        res.status(500).send(
            "No se pudo enviar el correo. Inténtalo nuevamente."
        );
    }
};
