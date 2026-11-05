import Usuario from "../models/usuario.js";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import Bitacora from "../models/bitacora.js";
// MOSTRAR REGISTRO
export const mostrarRegistro = (req, res) => {
    if (req.session.usuarioId) {
        return res.redirect("/");
    }

    res.render("registro");
};

// REGISTRAR USUARIO
export const registrarUsuario = async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;

        if (!nombre?.trim() || !correo?.trim() || !password) {
            return res.status(400).render("registro", {
                mensaje: "Todos los campos son obligatorios."
            });
        }

        if (password.length < 8) {
            return res.status(400).render("registro", {
                mensaje: "La contraseña debe tener al menos 8 caracteres."
            });
        }

        const correoNormalizado = correo.trim().toLowerCase();

        const usuarioExistente = await Usuario.findOne({
            correo: correoNormalizado
        });

        if (usuarioExistente) {
            return res.status(400).render("registro", {
                mensaje: "Este correo ya está registrado."
            });
        }

        // Convertir contraseña en hash
        const passwordHash = await bcrypt.hash(password, 12);

        // Guardar usuario con el nuevo campo
        await Usuario.create({
            nombre: nombre.trim(),
            correo: correoNormalizado,
            passwordHash
        });

        res.redirect("/login");

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(400).render("registro", {
                mensaje: "Este correo ya está registrado."
            });
        }

        res.status(500).send("Error al registrar usuario");
    }
};

// MOSTRAR LOGIN
export const mostrarLogin = (req, res) => {
    if (req.session.usuarioId) {
        return res.redirect("/");
    }

    res.render("login");
};

// INICIAR SESIÓN
export const iniciarSesion = async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo?.trim() || !password) {
            return res.status(400).render("login", {
                mensaje: "Completa todos los campos."
            });
        }

        const usuario = await Usuario.findOne({
            correo: correo.trim().toLowerCase()
        });

        if (!usuario) {
            return res.status(401).render("login", {
                mensaje: "Correo o contraseña incorrectos."
            });
        }

        // Compatibilidad con usuarios nuevos y anteriores
        const hashGuardado = usuario.passwordHash || usuario.password;

        if (!hashGuardado) {
            return res.status(401).render("login", {
                mensaje: "Correo o contraseña incorrectos."
            });
        }

        const passwordCorrecta = await bcrypt.compare(
            password,
            hashGuardado
        );

        if (!passwordCorrecta) {
            return res.status(401).render("login", {
                mensaje: "Correo o contraseña incorrectos."
            });
        }

        // Migrar automáticamente usuarios anteriores
        if (!usuario.passwordHash) {
            await Usuario.updateOne(
                { _id: usuario._id },
                {
                    $set: { passwordHash: hashGuardado },
                    $unset: { password: "" }
                }
            );
        }

       // Crear una sesión nueva
req.session.regenerate((error) => {
    if (error) {
        console.error(error);
        return res.status(500).send("Error al iniciar sesión");
    }

    // Guardar información del usuario
    req.session.usuarioId = usuario._id.toString();
    req.session.nombre = usuario.nombre;

    // Generar un nuevo token CSRF para la nueva sesión
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");

    // Guardar la sesión
    req.session.save(async (error) => {
    if (error) {
        console.error(error);
        return res.status(500).send("Error al guardar sesión");
    }

    // Registrar inicio de sesión en la bitácora
    try {
        await Bitacora.create({
            usuario: usuario._id,
            actividad: null,
            accion: "INICIAR_SESION",
            datosAnteriores: null,
            datosNuevos: null
        });

        console.log("Inicio de sesión registrado en la bitácora");

    } catch (errorBitacora) {
        console.error(
            "Error al registrar inicio de sesión:",
            errorBitacora
        );
    }

    res.redirect("/");
});
});

    } catch (error) {
        console.error(error);
        res.status(500).send("Error al iniciar sesión");
    }
};

// CERRAR SESIÓN
// CERRAR SESIÓN
export const cerrarSesion = async (req, res) => {

    try {

        // Obtener el ID del usuario antes de cerrar sesión
        const usuarioId = req.session.usuarioId;

        // Registrar el cierre de sesión en la bitácora
        if (usuarioId) {
            try {
                await Bitacora.create({
                    usuario: usuarioId,
                    actividad: null,
                    accion: "CERRAR_SESION",
                    datosAnteriores: null,
                    datosNuevos: null
                });

                console.log("Cierre de sesión registrado en la bitácora");

            } catch (errorBitacora) {
                console.error(
                    "Error al registrar cierre de sesión:",
                    errorBitacora
                );
            }
        }

        // Destruir la sesión
        req.session.destroy((error) => {

            if (error) {
                console.error(error);

                return res.status(500).send(
                    "Error al cerrar sesión"
                );
            }

            // Eliminar la cookie
            res.clearCookie("connect.sid");

            // Regresar al login
            res.redirect("/login");
        });

    } catch (error) {

        console.error("Error al cerrar sesión:", error);

        res.status(500).send("Error al cerrar sesión");
    }
};
