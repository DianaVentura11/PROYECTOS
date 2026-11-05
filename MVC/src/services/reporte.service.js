import PDFDocument from "pdfkit";

export const generarReportePDF = (res, usuario, actividades, filtro) => {
    const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        bufferPages: true
    });

    doc.on("error", (error) => {
        console.error("Error al construir el PDF:", error);
        if (!res.headersSent) {
            res.status(500).end("No se pudo generar el reporte PDF.");
        } else {
            res.destroy(error);
        }
    });

    doc.pipe(res);

    let titulo = "Reporte de todas las actividades";
    if (filtro === "pendientes") {
        titulo = "Reporte de actividades pendientes";
    } else if (filtro === "completadas") {
        titulo = "Reporte de actividades completadas";
    }

    doc.font("Helvetica-Bold")
        .fontSize(20)
        .text(titulo, { align: "center" });

    doc.moveDown();
    doc.font("Helvetica")
        .fontSize(11)
        .text(`Usuario: ${usuario || "Usuario"}`)
        .text(`Fecha de generación: ${new Date().toLocaleString("es-MX")}`);

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    if (!actividades.length) {
        doc.fontSize(12).text(
            "No se encontraron actividades para el filtro elegido."
        );
    } else {
        actividades.forEach((actividad, index) => {
            // Evitar que una actividad quede cortada al final de la página.
            if (doc.y > 680) {
                doc.addPage();
            }

            doc.font("Helvetica-Bold")
                .fontSize(13)
                .text(`${index + 1}. ${actividad.nombre || "Sin nombre"}`);

            doc.font("Helvetica")
                .fontSize(10)
                .text(`Descripción: ${actividad.descripcion || "Sin descripción"}`)
                .text(`Estado: ${actividad.estado ? "Completada" : "Pendiente"}`)
                .text(
                    `Fecha límite: ${
                        actividad.fechaLimite
                            ? new Date(actividad.fechaLimite).toLocaleDateString("es-MX")
                            : "No disponible"
                    }`
                );

            doc.moveDown(0.7);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown();
        });
    }

    doc.moveDown();
    doc.font("Helvetica-Bold")
        .fontSize(12)
        .text(`Total de actividades incluidas: ${actividades.length}`);

    doc.end();
};
