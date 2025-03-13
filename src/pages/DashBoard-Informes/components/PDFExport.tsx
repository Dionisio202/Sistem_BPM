import React, { ReactNode, useState } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { FaDownload, FaSpinner } from "react-icons/fa";
import { 
  addExecutiveSummary,
  addPageHeader, 
  addFooter, 
  addSectionTitle,
  addObservationsPage,
  generateFileName
} from "./hooks/pdfSummaryModule"; // Ajusta la ruta según tu estructura de directorios

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
  reportStats?: {
    totalRegistros: number;
    registrosFinalizados: number;
    registrosEnProceso: number;
    registrosInicio: number;
  };
  additionalInfo?: {
    universidad: string;
    direccion: string;
    departamento: string;
    responsable: string;
    fechaGeneracion: string;
  };
}

const PDFExport: React.FC<PDFExportProps> = ({
  children,
  captureIds,
  filtersData,
  reportStats = {
    totalRegistros: 0,
    registrosFinalizados: 0,
    registrosEnProceso: 0,
    registrosInicio: 0,
  },
  additionalInfo = {
    universidad: "Universidad Técnica de Ambato",
    direccion: "Dirección de Innovación y Emprendimiento",
    departamento: "Departamento de Propiedad Intelectual",
    responsable: "Administrador del Sistema",
    fechaGeneracion: new Date().toLocaleDateString("es-ES"),
  }
}) => {
  const [isExporting, setIsExporting] = useState(false);
  
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
    try {
      setIsExporting(true);
      
      const pdf = new jsPDF("l", "pt", "a4"); // 'l' for landscape
      const pdfWidth = pdf.internal.pageSize.getWidth();
      let pageNumber = 1;

      // Añadir resumen ejecutivo en la primera página utilizando la función modularizada
      addExecutiveSummary(pdf, filtersData, reportStats, additionalInfo);
      
      // Títulos de secciones para agrupar los elementos capturados
      const sectionTitles = {
        "cardprincipal": "INFORMACION GENERAL",
        "taskProgress": "REGISTROS POR CARRERA ",
        "granttchart": "DETALLE DE REGISTROS DE PROPIEDAD INTELECTUAL",
        "table": "CANTIDAD POR TIPO DE PRODUCTO"
      };

      // === 2) Capturar cada elemento con mejoras
      for (let i = 0; i < captureIds.length; i++) {
        const elementId = captureIds[i];
        
        // Capture each element with our improved function
        const canvas = await captureElement(elementId);
        
        if (canvas) {
          // Añadir nueva página para cada elemento
          pdf.addPage();
          pageNumber++;
          
          // Add header to each new page
          addPageHeader(pdf, filtersData);
          
          // Añadir título de la sección
          const sectionTitle = sectionTitles[elementId as keyof typeof sectionTitles] || `SECCIÓN ${i + 1}`;
          let yPosition = 100;
          yPosition = addSectionTitle(pdf, sectionTitle, yPosition);
          
          const imgData = canvas.toDataURL("image/png");

          // Dimensiones predeterminadas
          let desiredWidth = 500;
          let desiredHeight = 300;
          
          // Ajustes específicos por tipo de elemento
          if (elementId === "granttchart") {
            desiredWidth = 800;
            desiredHeight = 400;
          } else if (elementId === "taskProgress") {
            desiredWidth = 700;
            desiredHeight = 380;
          } else if (elementId === "table") {
            desiredWidth = 600;
            desiredHeight = 350;
          } else if (elementId === "cardprincipal") {
            desiredWidth = 700;
            desiredHeight = 400;
          }

          // Calcular la posición x para centrar la imagen según su ancho
          const xPosition = (pdfWidth - desiredWidth) / 2;

          // Agregar la imagen en la posición calculada
          pdf.addImage(imgData, "PNG", xPosition, yPosition, desiredWidth, desiredHeight);
          
          // Añadir pie de página
          addFooter(pdf, pageNumber, additionalInfo);
        }
      }
      
      // Añadir página final con observaciones utilizando la función modularizada
      pageNumber++;
      addObservationsPage(pdf, pageNumber, filtersData, additionalInfo);
      
      // Guardar el PDF con el nombre generado
      pdf.save(generateFileName(filtersData));
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div>
      {children}
      
      {/* Botón de descarga con el nuevo diseño y centrado */}
      <div className="flex justify-center mt-5 mb-5">
        <button
          onClick={exportToPDF}
          disabled={isExporting}
          className={`${
            isExporting ? "bg-gray-500" : "bg-red-600 hover:bg-red-700"
          } text-white p-4 rounded-lg flex items-center justify-center transition-colors`}
        >
          {isExporting ? (
            <>
              Generando PDF <FaSpinner className="ml-2 animate-spin" />
            </>
          ) : (
            <>
              Exportar a PDF <FaDownload className="ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PDFExport;