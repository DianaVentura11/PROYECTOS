import { Schema, model } from "mongoose";

const usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },

    correo: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    passwordHash: {
        type: String,
        required: true
    },
    
    password: {
        type: String
    },
    
    rol: {
    type: String,
    enum: ["admin", "usuario"],
    default: "usuario"
    }
}, {
    timestamps: true
});

export default model("Usuario", usuarioSchema);