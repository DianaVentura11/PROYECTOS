import {
    generarTokenCSRF,
    verificarTokenCSRF
} from "./middlewares/csrf.js";

import express from "express";
import morgan from "morgan";
import exphbs from "express-handlebars";
import session from "express-session";
import MongoStore from "connect-mongo";
import indexRoutes from "./routes/index.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import Usuario from "./models/usuario.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,

    store: MongoStore.create({
        mongoUrl: process.env.URI_MONGODB,
        collectionName: "sessions",
        ttl: 30 * 60
    }),

    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 30 * 60 * 1000
    }
}));

// GENERAR TOKEN CSRF
app.use(generarTokenCSRF);

// VERIFICAR TOKEN CSRF
app.use((req, res, next) => {

    if (req.method === "POST") {
        return verificarTokenCSRF(req, res, next);
    }

    next();
});

// Configuración de vistas
app.set("views", path.join(__dirname, "views"));

app.engine(".hbs", exphbs.engine({
    layoutsDir: path.join(app.get("views"), "layouts"),
    extname: ".hbs",
    defaultLayout: "main"
}));

app.set("view engine", ".hbs");

// Compartir información de sesión con las vistas
app.use(async (req, res, next) => {
    try {

        res.locals.usuario = null;
        res.locals.esAdmin = false;

        // Comprobar si existe una sesión
        if (req.session.usuarioId) {

            // Buscar al usuario en MongoDB
            const usuario = await Usuario.findById(
                req.session.usuarioId
            );

            if (usuario) {

                // Compartir los datos con las vistas
                res.locals.usuario = {
                    nombre: usuario.nombre
                };

                // Comprobar si es administrador
                res.locals.esAdmin = usuario.rol === "admin";
            }
        }

        next();

    } catch (error) {

        console.error("Error al consultar el usuario:", error);

        next(error);
    }
});
// Rutas
app.use(indexRoutes);

export default app;