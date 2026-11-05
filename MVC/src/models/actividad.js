
import { Schema, model } from "mongoose";

const actividadSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },

    descripcion: {
        type: String,
        required: true
    },

    estado: {
        type: Boolean,
        default: false
    },

    fechaLimite: {
        type: Date,
        default: null
    },

    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    }

}, {
    timestamps: true,
    versionKey: false
});

export default model("actividad", actividadSchema);