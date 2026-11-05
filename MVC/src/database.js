import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.URI_MONGODB);
        console.log("MongoDB conectado correctamente");
    } catch (error) {
        console.error("Error conectando a MongoDB:", error);
    }
};