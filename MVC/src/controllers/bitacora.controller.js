import Bitacora from "../models/bitacora.js";

// MOSTRAR BITÁCORA AL ADMINISTRADOR
export const mostrarBitacora = async (req, res) => {

    try {

        // Consultar todos los registros de la bitácora
        const registros = await Bitacora.find({})

            // Obtener el nombre y correo del usuario
            .populate("usuario", "nombre correo")

            // Ordenar del más reciente al más antiguo
            .sort({ createdAt: -1 })

            .lean();

        // Mostrar la vista de la bitácora
        res.render("bitacora", {
            registros
        });

    } catch (error) {

        console.error("Error al consultar la bitácora:", error);

        res.status(500).send(
            "Error al consultar la bitácora"
        );
    }
};