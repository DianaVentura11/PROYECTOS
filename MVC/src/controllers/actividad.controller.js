
import actividadModel from "../models/actividad.js";
import mongoose from "mongoose";
import Bitacora from "../models/bitacora.js";
import Usuario from "../models/usuario.js";
import { generarReportePDF } from "../services/reporte.service.js";
// MOSTRAR ACTIVIDADES DEL USUARIO

export const mostrarActividades = async (req, res) => {
    try {

        // Buscar las actividades del usuario
        const actividades = await actividadModel.find({
            usuario: req.session.usuarioId
        }).lean();

        // Buscar los datos del usuario en MongoDB
        const usuario = await Usuario.findById(
            req.session.usuarioId
        ).select("nombre correo").lean();

        if (!usuario) {
            return res.status(404).send(
                "Usuario no encontrado"
            );
        }

        // Enviar actividades y correo a la vista
        res.render("index", {
            actividades,
            correoUsuario: usuario.correo
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener actividades");
    }
};


export const agregarActividad = async (req, res) => {

    const { nombre, descripcion, fechaLimite } = req.body;

    if (
        typeof nombre !== "string" ||
        typeof descripcion !== "string" ||
        !nombre.trim() ||
        !descripcion.trim()
    ) {
        return res.status(400).send(
            "Nombre y descripción son obligatorios"
        );
    }

    const session = await mongoose.startSession();

    try {

        await session.withTransaction(async () => {

            // 1. Crear la actividad
            const actividad = new actividadModel({
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
                usuario: req.session.usuarioId
            });

            await actividad.save({ session });

            // 2. Registrar la acción en la bitácora
            await Bitacora.create([{
                usuario: req.session.usuarioId,
                actividad: actividad._id,
                accion: "CREAR",
                datosAnteriores: null,
                datosNuevos: {
                    nombre: actividad.nombre,
                    descripcion: actividad.descripcion,
                    estado: actividad.estado
                }
            }], { session });

        });

        res.redirect("/");

    } catch (error) {

        console.error("Error al crear actividad:", error);

        res.status(500).send(
            "Error al guardar la actividad y su bitácora"
        );

    } finally {

        await session.endSession();

    }
};

// MOSTRAR FORMULARIO PARA EDITAR
export const mostrarEditar = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).send("Actividad no encontrada");
        }

        const actividad = await actividadModel.findOne({
            _id: req.params.id,
            usuario: req.session.usuarioId
        }).lean();

        if (!actividad) {
            return res.status(404).send("Actividad no encontrada");
        }

        res.render("editar", { actividad });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error al buscar actividad");
    }
};

// GUARDAR CAMBIOS
export const editarActividad = async (req, res) => {

    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).send("Actividad no encontrada");
    }

    const { nombre, descripcion, estado } = req.body;

    if (
        typeof nombre !== "string" ||
        typeof descripcion !== "string" ||
        !nombre.trim() ||
        !descripcion.trim()
    ) {
        return res.status(400).send(
            "Nombre y descripción son obligatorios"
        );
    }

    const session = await mongoose.startSession();

    try {

        await session.withTransaction(async () => {

            // 1. Buscar la actividad del usuario
            const actividad = await actividadModel.findOne({
                _id: req.params.id,
                usuario: req.session.usuarioId
            }).session(session);

            if (!actividad) {
                throw new Error("ACTIVIDAD_NO_ENCONTRADA");
            }

            // 2. Guardar los datos anteriores
            const datosAnteriores = {
                nombre: actividad.nombre,
                descripcion: actividad.descripcion,
                estado: actividad.estado
            };

            // 3. Actualizar la actividad
            actividad.nombre = nombre.trim();
            actividad.descripcion = descripcion.trim();
            actividad.estado = estado === "true";

            await actividad.save({ session });

            // 4. Registrar el cambio en la bitácora
            await Bitacora.create([{
                usuario: req.session.usuarioId,
                actividad: actividad._id,
                accion: "EDITAR",
                datosAnteriores: datosAnteriores,
                datosNuevos: {
                    nombre: actividad.nombre,
                    descripcion: actividad.descripcion,
                    estado: actividad.estado
                }
            }], { session });

        });

        res.redirect("/");

    } catch (error) {

        console.error("Error al editar actividad:", error);

        if (error.message === "ACTIVIDAD_NO_ENCONTRADA") {
            return res.status(404).send(
                "Actividad no encontrada"
            );
        }

        res.status(500).send(
            "Error al editar la actividad y su bitácora"
        );

    } finally {

        await session.endSession();

    }
};

// CONSULTAR ESTADO
export const consultarEstado = async (req, res) => {
    try {
        const { nombre } = req.query;

        if (!nombre?.trim()) {
            return res.render("estado");
        }

        const actividad = await actividadModel.findOne({
            nombre: nombre.trim(),
            usuario: req.session.usuarioId
        }).lean();

        if (!actividad) {
            return res.render("estado", {
                mensaje: "No se encontró una actividad con ese nombre."
            });
        }

        res.render("estado", { actividad });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error al consultar estado");
    }
};

// ELIMINAR ACTIVIDAD
export const eliminarActividad = async (req, res) => {

    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).send("Actividad no encontrada");
    }

    const session = await mongoose.startSession();

    try {

        await session.withTransaction(async () => {

            // 1. Buscar la actividad del usuario
            const actividad = await actividadModel.findOne({
                _id: req.params.id,
                usuario: req.session.usuarioId
            }).session(session);

            if (!actividad) {
                throw new Error("ACTIVIDAD_NO_ENCONTRADA");
            }

            // 2. Guardar los datos antes de eliminarlos
            const datosAnteriores = {
                nombre: actividad.nombre,
                descripcion: actividad.descripcion,
                estado: actividad.estado
            };

            // 3. Eliminar la actividad
            await actividadModel.deleteOne(
                {
                    _id: actividad._id,
                    usuario: req.session.usuarioId
                },
                { session }
            );

            // 4. Registrar la eliminación en la bitácora
            await Bitacora.create([{
                usuario: req.session.usuarioId,
                actividad: actividad._id,
                accion: "ELIMINAR",
                datosAnteriores: datosAnteriores,
                datosNuevos: null
            }], { session });

        });

        res.redirect("/");

    } catch (error) {

        console.error("Error al eliminar actividad:", error);

        if (error.message === "ACTIVIDAD_NO_ENCONTRADA") {
            return res.status(404).send(
                "Actividad no encontrada"
            );
        }

        res.status(500).send(
            "Error al eliminar la actividad y su bitácora"
        );

    } finally {

        await session.endSession();

    }
};


// GENERAR Y DESCARGAR REPORTE PDF
export const descargarReporte = async (req, res) => {
    try {
        const filtro = req.query.filtro || "todas";
        const filtrosPermitidos = ["todas", "pendientes", "completadas"];

        if (!filtrosPermitidos.includes(filtro)) {
            return res.status(400).send(
                "El filtro seleccionado no es válido."
            );
        }

        if (!req.session.usuarioId) {
            return res.redirect("/login");
        }

        // Consultar únicamente las actividades del usuario que inició sesión.
        const consulta = {
            usuario: req.session.usuarioId
        };

        if (filtro === "pendientes") {
            consulta.estado = false;
        } else if (filtro === "completadas") {
            consulta.estado = true;
        }

        const [actividades, usuario] = await Promise.all([
            actividadModel.find(consulta).sort({ createdAt: -1 }).lean(),
            Usuario.findById(req.session.usuarioId).select("nombre correo").lean()
        ]);

        if (!usuario) {
            return res.status(404).send("No se encontró el usuario de la sesión.");
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="reporte-actividades.pdf"'
        );

        generarReportePDF(
            res,
            usuario.nombre || usuario.correo,
            actividades,
            filtro
        );
    } catch (error) {
        console.error("Error al consultar o generar el reporte PDF:", error);

        if (!res.headersSent) {
            return res.status(500).send(
                "Ocurrió un problema al generar el reporte. Intenta nuevamente."
            );
        }

        res.destroy(error);
    }
};
