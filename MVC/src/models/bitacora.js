import { Schema, model } from "mongoose";

const bitacoraSchema = new Schema({

    // Usuario que realizó la acción
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },

    // Actividad relacionada (opcional)
    actividad: {
        type: Schema.Types.ObjectId,
        ref: "actividad",
        default: null
    },

    // Acción realizada
    accion: {
        type: String,
        enum: [
            "INICIAR_SESION",
            "CERRAR_SESION",
            "CREAR",
            "EDITAR",
            "ELIMINAR"
        ],
        required: true
    },

    // Información antes de modificar una actividad
    datosAnteriores: {
        type: Schema.Types.Mixed,
        default: null
    },

    // Información después de modificar una actividad
    datosNuevos: {
        type: Schema.Types.Mixed,
        default: null
    }

}, {
    timestamps: true
});

export default model("Bitacora", bitacoraSchema);