import React, { ReactNode } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import logo from "../../../assets/img/logoUTA.png";
import { FaDownload } from "react-icons/fa";

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

  // Helper function to wait before capturing to ensure components are rendered
  const waitForElementRender = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  const captureElement = async (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return null;
    
    // Wait for a moment to ensure components are fully rendered
    await waitForElementRender(300);
    
    // Use improved html2canvas options
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true, // Allow cross-origin images
      allowTaint: true, // Allow tainting with cross-origin content
      backgroundColor: null, // Transparent background
      logging: false, // Disable logging
      imageTimeout: 0, // No timeout for images
      onclone: (documentClone) => {
        // This gives us access to the cloned document before capture
        // We can make modifications if needed
        const clonedElement = documentClone.getElementById(elementId);
        if (clonedElement) {
          // Force all SVG elements to be visible in the clone
          const svgElements = clonedElement.querySelectorAll('svg');
          svgElements.forEach(svg => {
            svg.style.visibility = 'visible';
            svg.style.display = 'block';
          });
          
          // Ensure text elements are visible
          const textElements = clonedElement.querySelectorAll('text');
          textElements.forEach(text => {
            text.style.visibility = 'visible';
            text.style.fontFamily = 'Arial, sans-serif';
          });
        }
        return documentClone;
      }
    });
    
    return canvas;
  };

  const exportToPDF = async () => {
    const pdf = new jsPDF("l", "pt", "a4"); // 'l' for landscape
    const pdfWidth = pdf.internal.pageSize.getWidth(); // ancho de la página en puntos

    // === 1) Agregas el encabezado (texto e imagen, si deseas) en la primera página
    // ----------------------------------------------------------
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

    // === 2) Capturar cada elemento con mejoras
    // ----------------------------------------------------------
    const startY = 100; // posición vertical de inicio

    for (let i = 0; i < captureIds.length; i++) {
      // Capture each element with our improved function
      const canvas = await captureElement(captureIds[i]);
      
      if (canvas) {
        const imgData = canvas.toDataURL("image/png");

        // Dimensiones predeterminadas
        let desiredWidth = 300;
        let desiredHeight = 300;
        
        // Si es la imagen con ID "taskProgress", hacerla más ancha
        if (captureIds[i] === "granttchart") {
          desiredWidth = 800; // Ancho mayor para esta imagen específica
          desiredHeight = 300; // Altura ajustada
        }

        // Si i > 0, añadimos una nueva página
        if (i > 0) {
          pdf.addPage();
          
          // En cada nueva página, si deseas repetir el encabezado
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

        // Calcular la posición x para centrar la imagen según su ancho
        const xPosition = (pdfWidth - desiredWidth) / 2;

        // Agregar la imagen en la posición calculada
        pdf.addImage(imgData, "PNG", xPosition, startY, desiredWidth, desiredHeight);
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
      {/* Botón de descarga con el nuevo diseño y centrado */}
      <div className="flex justify-center mt-5 mb-5">
        <button
          onClick={exportToPDF}
          className="bg-red-600 text-white p-4 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors"
        >
          Exportar a PDF <FaDownload className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default PDFExport;