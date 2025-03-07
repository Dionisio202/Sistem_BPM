// PDFExport.tsx
import React, { ReactNode } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import logo from "../../../assets/img/logoUTA.png";

interface PDFExportProps {
  children: ReactNode;
  captureIds: string[];
  filtersData: {
    year: string;
    facultad: string;
    estado: string;
    fechaInicio: string;
    fechaFin: string;
  };
}

const PDFExport: React.FC<PDFExportProps> = ({
  children,
  captureIds,
  filtersData,
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      .replace(/^(\d{2})/, "$1 de");
  };
  const buildSubtitle = () => {
    const parts = [];

    if (filtersData.year) parts.push(`Del año ${filtersData.year}`);
    if (filtersData.facultad)
      parts.push(`de la facultad de ${filtersData.facultad}`);
    if (filtersData.estado)
      parts.push(
        `con el estado de registro ${filtersData.estado.toLowerCase()}`
      );

    if (filtersData.fechaInicio && filtersData.fechaFin) {
      const inicio = formatDate(filtersData.fechaInicio);
      const fin = formatDate(filtersData.fechaFin);
      parts.push(`del periodo ${inicio} al ${fin}`);
    }

    return parts.join(" ");
  };

  const exportToPDF = async () => {
    const pdf = new jsPDF("p", "pt", "a4"); // 'pt' para puntos, 'a4' tamaño de la página
    const pdfWidth = pdf.internal.pageSize.getWidth(); // ancho de la página en puntos

    // === 1) Agregas el encabezado (texto e imagen, si deseas) en la primera página
    // ----------------------------------------------------------
    // Ejemplo: Añadir un logo en la esquina superior izquierda
    // Ajusta x, y, width y height según tus necesidades
    // Si tu imagen está en base64, la puedes colocar directamente
    pdf.addImage(logo, "PNG", 40, 15, 60, 60);

    // Luego, agregas texto
    pdf.setFontSize(14);
    pdf.setTextColor(60, 60, 60);
    pdf.text("DIRECCION DE INNOVACION Y EMPRENDIMIENTO", pdfWidth / 2, 40, {
      align: "center",
    });

    pdf.setFontSize(12);
    pdf.text("REPORTE DE REGISTRO DE PROPIEDAD INTELECTUAL", pdfWidth / 2, 60, {
      align: "center",
    });
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);

    // Subtítulo
    const subtitleText = buildSubtitle();
    if (subtitleText) {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(subtitleText, pdfWidth / 2, 80, {
        align: "center",
        maxWidth: 400,
      });
    }

    // Dibujar una línea horizontal para separar
    pdf.setDrawColor(60, 60, 60); // color de la línea
    pdf.setLineWidth(0.5);
    pdf.line(40, 70, pdfWidth - 40, 70); // (x1, y1, x2, y2)

    // === 2) Ahora, debajo del encabezado, vas iterando y añadiendo el contenido capturado
    // ----------------------------------------------------------
    // Para evitar que se “pise” con el encabezado, podrías
    // iniciar la imagen un poco más abajo (por ejemplo, y=100)

    const startY = 100; // posición vertical de inicio
    let currentPage = 0; // para saber cuándo agregar página

    for (let i = 0; i < captureIds.length; i++) {
      const element = document.getElementById(captureIds[i]);
      if (element) {
        // Capturamos el contenido con html2canvas
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        // Calculamos un ancho de imagen que se ajuste al PDF
        // y alto proporcional
        const desiredWidth = 300;
        const desiredHeight = 300;

        // Si i > 0, añadimos una nueva página
        if (i > 0) {
          pdf.addPage();
          currentPage++;
          // En cada nueva página, si deseas repetir el encabezado, puedes volver a dibujarlo:
          pdf.setFontSize(14);
          pdf.setTextColor(60, 60, 60);
          pdf.text(
            "DIRECCION DE INNOVACION Y EMPRENDIMIENTO",
            pdfWidth / 2,
            40,
            {
              align: "center",
            }
          );
          pdf.setFontSize(12);
          pdf.text(
            "REPORTE DE REGISTRO DE PROPIEDAD INTELECTUAL",
            pdfWidth / 2,
            60,
            {
              align: "center",
            }
          );
          pdf.setDrawColor(60, 60, 60);
          pdf.setLineWidth(0.5);
          pdf.line(40, 70, pdfWidth - 40, 70);
        }

        // Agregar la imagen en la posición (x=40, y=startY) para dejar margen
        pdf.addImage(imgData, "PNG", 160, startY, desiredWidth, desiredHeight);
      }
    }
    const generateFileName = () => {
      const cleanText = (text: string) =>
        text
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
          .replace(/[^\w\s]/gi, "") // Eliminar caracteres especiales
          .replace(/\s+/g, "_"); // Espacios a guiones bajos

      const parts = ["Reporte"];
      const { year, facultad, estado, fechaInicio, fechaFin } = filtersData;

      if (year) parts.push(year);
      if (facultad) parts.push(cleanText(facultad));
      if (estado) parts.push(cleanText(estado));

      if (fechaInicio && fechaFin) {
        const format = (dateStr: string) => {
          const d = new Date(dateStr);
          return `${d.getDate().toString().padStart(2, "0")}-${(
            d.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}-${d.getFullYear()}`;
        };
        parts.push(`${format(fechaInicio)}_a_${format(fechaFin)}`);
      }

      return parts.length > 1
        ? parts.join("_") + ".pdf"
        : `Reporte_General_${new Date().toISOString().split("T")[0]}.pdf`;
    };

    pdf.save(generateFileName());
  };
  return (
    <div>
      {children}
      <button
        onClick={exportToPDF}
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "10px 20px",
          fontSize: "16px",
          margin: "20px auto",
          display: "block",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        Exportar a PDF
      </button>
    </div>
  );
};

export default PDFExport;