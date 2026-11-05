
import { Router } from "express";
import { enviarPendientes } from "../controllers/correo.controller.js";
import { mostrarBitacora } from "../controllers/bitacora.controller.js";
// Middleware para verificar la sesión
import { verificarSesion, verificarAdmin } from "../middlewares/auth.js";

// Controlador de actividades
import {
    mostrarActividades,
    agregarActividad,
    mostrarEditar,
    editarActividad,
    consultarEstado,
    eliminarActividad,
    descargarReporte
} from "../controllers/actividad.controller.js";

// Controlador de usuarios
import {
    mostrarRegistro,
    registrarUsuario,
    mostrarLogin,
    iniciarSesion,
    cerrarSesion
} from "../controllers/usuario.controller.js";

const router = Router();
router.post("/correo/pendientes", verificarSesion, enviarPendientes);

// =====================================
// REGISTRO DE USUARIOS
// =====================================

// ENVIAR ACTIVIDADES PENDIENTES POR CORREO


// Mostrar formulario de registro
router.get("/registro", mostrarRegistro);

// Registrar nuevo usuario
router.post("/registro", registrarUsuario);


// =====================================
// INICIO DE SESIÓN
// =====================================

// Mostrar formulario de inicio de sesión
router.get("/login", mostrarLogin);

// Verificar correo y contraseña
router.post("/login", iniciarSesion);


// =====================================
// CERRAR SESIÓN
// =====================================

// Cerrar sesión del usuario
router.post("/logout", verificarSesion, cerrarSesion);


// =====================================
// INICIO - ACTIVIDADES
// =====================================

// Mostrar actividades
router.get("/", verificarSesion, mostrarActividades);

// Descargar reporte PDF de las actividades del usuario
router.get("/actividades/reporte", verificarSesion, descargarReporte);


// =====================================
// AGREGAR ACTIVIDAD
// =====================================

router.post(
    "/actividad/add",
    verificarSesion,
    agregarActividad
);


// =====================================
// EDITAR ACTIVIDAD
// =====================================

// Mostrar formulario de edición
router.get(
    "/edit/:id",
    verificarSesion,
    mostrarEditar
);

// Guardar cambios
router.post(
    "/actividad/editar/:id",
    verificarSesion,
    editarActividad
);


// =====================================
// CONSULTAR ESTADO
// =====================================

router.get(
    "/estado",
    verificarSesion,
    consultarEstado
);


// =====================================
// ELIMINAR ACTIVIDAD
// =====================================

router.post(
    "/actividad/eliminar/:id",
    verificarSesion,
    eliminarActividad
);


// =====================================
// PÁGINA ABOUT
// =====================================

router.get("/about", verificarSesion, (req, res) => {
    res.render("about");
});

router.get("/bitacora", verificarSesion, verificarAdmin, mostrarBitacora);

// =====================================
// EXPORTAR RUTAS
// =====================================

export default router;
