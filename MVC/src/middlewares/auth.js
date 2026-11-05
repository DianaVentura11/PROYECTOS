import Usuario from "../models/usuario.js";

// VERIFICAR QUE EL USUARIO INICIÓ SESIÓN
export const verificarSesion = (req, res, next) => {

    if (!req.session.usuarioId) {
        return res.redirect("/login");
    }

    next();
};


// VERIFICAR SI EL USUARIO ES ADMINISTRADOR
export const verificarAdmin = async (req, res, next) => {
    try {

        // Comprobar que exista una sesión
        if (!req.session.usuarioId) {
            return res.redirect("/login");
        }

        // Buscar al usuario en MongoDB
        const usuario = await Usuario.findById(req.session.usuarioId);

        // Comprobar si es administrador
        if (!usuario || usuario.rol !== "admin") {
            return res.status(403).send(
                "Acceso denegado. Solo el administrador puede consultar la bitácora."
            );
        }

        // Permitir el acceso
        next();

    } catch (error) {

        console.error("Error al verificar administrador:", error);

        res.status(500).send(
            "Error al verificar los permisos del usuario"
        );
    }
};