
import crypto from "node:crypto";

// GENERAR TOKEN CSRF
export const generarTokenCSRF = (req, res, next) => {

    if (!req.session.csrfToken) {
        req.session.csrfToken =
            crypto.randomBytes(32).toString("hex");
    }

    res.locals.csrfToken = req.session.csrfToken;

    next();
};

// VERIFICAR TOKEN CSRF
export const verificarTokenCSRF = (req, res, next) => {

    const tokenEnviado = req.body?._csrf;
    const tokenGuardado = req.session?.csrfToken;

    if (
        typeof tokenEnviado !== "string" ||
        typeof tokenGuardado !== "string"
    ) {
        return res.status(403).send(
            "Error de seguridad: token CSRF inválido."
        );
    }

    const enviado = Buffer.from(tokenEnviado, "utf8");
    const guardado = Buffer.from(tokenGuardado, "utf8");

    if (
        enviado.length !== guardado.length ||
        !crypto.timingSafeEqual(enviado, guardado)
    ) {
        return res.status(403).send(
            "Error de seguridad: token CSRF inválido."
        );
    }

    next();
};
