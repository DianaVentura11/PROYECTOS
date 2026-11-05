// Cargar las variables de entorno primero
import "dotenv/config";

import app from "./app.js";
import { conectarDB } from "./database.js";
import { verificarCorreo } from "./config/correo.js";

const PORT = process.env.PORT || 3000;

// Conectar MongoDB
conectarDB();

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

// Verificar conexión con Gmail
verificarCorreo();