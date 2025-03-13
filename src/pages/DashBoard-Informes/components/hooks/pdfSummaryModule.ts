import { jsPDF } from "jspdf";
import logo from "../../../../assets/img/logoUTA.png";

// Tipos de datos
interface FilterData {
  year: string;
  facultad: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
}

interface ReportStats {
  totalRegistros: number;
  registrosFinalizados: number;
  registrosEnProceso: number;
  registrosInicio: number;
}

interface AdditionalInfo {
  universidad: string;
  direccion: string;
  departamento: string;
  responsable: string;
  fechaGeneracion: string;
}

// Función para formatear fechas
export const formatDate = (dateString: string) => {
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



// Función para añadir encabezado a cada página
export const addPageHeader = (pdf: jsPDF, _filtersData: FilterData) => {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  
  // Add logo
  pdf.addImage(logo, "PNG", 40, 15, 60, 60);

  // Add text headers
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(60, 60, 60);
  pdf.text("DIRECCION DE INNOVACION Y EMPRENDIMIENTO", pdfWidth / 2, 40, {
    align: "center",
  });

  pdf.setFontSize(12);
  pdf.text("REPORTE DE REGISTRO DE PROPIEDAD INTELECTUAL", pdfWidth / 2, 60, {
    align: "center",
  });
  
  // Add separator line
  pdf.setDrawColor(60, 60, 60);
  pdf.setLineWidth(0.5);
  pdf.line(40, 70, pdfWidth - 40, 70);
  

};

// Función para añadir pie de página a cada página
export const addFooter = (pdf: jsPDF, pageNumber: number, additionalInfo: AdditionalInfo) => {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  // Añadir línea separadora
  pdf.setDrawColor(60, 60, 60);
  pdf.setLineWidth(0.3);
  pdf.line(40, pdfHeight - 30, pdfWidth - 40, pdfHeight - 30);
  
  // Añadir texto de pie de página
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  
  // Lado izquierdo - Información adicional
  pdf.text(`${additionalInfo.universidad} - ${additionalInfo.direccion}`, 40, pdfHeight - 20);
  pdf.text(`Documento generado el ${additionalInfo.fechaGeneracion}`, 40, pdfHeight - 10);
  
  // Lado derecho - Número de página
  pdf.text(`Página ${pageNumber}`, pdfWidth - 60, pdfHeight - 15);
};

// Función para añadir títulos de secciones
export const addSectionTitle = (pdf: jsPDF, title: string, yPosition: number) => {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  
  // Fondo para el título con azul claro (similar a la segunda imagen)
  pdf.setFillColor(65, 105, 225);
  pdf.rect(40, yPosition - 15, pdfWidth - 80, 20, "F");
  
  // Texto del título (en blanco para contraste sobre azul)
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.text(title, pdfWidth / 2, yPosition, {
    align: "center",
  });
  
  return yPosition + 25; // Devolver la nueva posición Y después del título
};

// Función para crear tablas, ahora con soporte para filas en negrita
export const createTable = (
  pdf: jsPDF, 
  headers: string[], 
  data: string[][], 
  startY: number, 
  widths?: number[],
  boldRows?: number[] // Nuevo parámetro: índices de filas que deben estar en negrita
) => {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const startX = 40;
  const tableWidth = pdfWidth - 80;
  
  // Calcular anchos de columna si no se proporcionan
  const colWidths = widths || Array(headers.length).fill(tableWidth / headers.length);
  
  // Establecer estilo para encabezados
  pdf.setFillColor(220, 230, 240);
  pdf.setTextColor(60, 60, 60);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  
  // Dibujar encabezados de la tabla
  let x = startX;
  let y = startY;
  const rowHeight = 12;
  
  // Dibujar fondo para encabezados
  pdf.rect(startX, y, tableWidth, rowHeight, "F");
  
  // Dibujar texto de encabezados
  headers.forEach((header, i) => {
    pdf.text(header, x + colWidths[i]/2, y + rowHeight/2 + 3, { align: "center" });
    x += colWidths[i];
  });
  
  // Dibujar líneas de la tabla para encabezados
  x = startX;
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.3);
  
  // Línea horizontal después de encabezados
  pdf.line(startX, y, startX + tableWidth, y);
  pdf.line(startX, y + rowHeight, startX + tableWidth, y + rowHeight);
  
  // Líneas verticales
  for (let i = 0; i <= headers.length; i++) {
    if (i === 0) {
      pdf.line(x, y, x, y + rowHeight);
    } else if (i < headers.length) {
      x += colWidths[i-1];
      pdf.line(x, y, x, y + rowHeight);
    } else {
      pdf.line(startX + tableWidth, y, startX + tableWidth, y + rowHeight);
    }
  }
  
  // Dibujar filas de datos
  y += rowHeight;
  pdf.setTextColor(80, 80, 80);
  pdf.setFont("helvetica", "normal");
  
  data.forEach((row, rowIndex) => {
    x = startX;
    
    // Alternar colores de fondo para filas
    if (rowIndex % 2 === 0) {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(startX, y, tableWidth, rowHeight, "F");
    }
    
    // Verificar si esta fila debe estar en negrita
    const isBold = boldRows && boldRows.includes(rowIndex);
    if (isBold) {
      pdf.setFont("helvetica", "bold");
    } else {
      pdf.setFont("helvetica", "normal");
    }
    
    // Dibujar texto de la fila
    row.forEach((cell, i) => {
      pdf.text(cell, x + colWidths[i]/2, y + rowHeight/2 + 3, { align: "center" });
      x += colWidths[i];
    });
    
    // Dibujar líneas horizontales
    pdf.line(startX, y, startX + tableWidth, y);
    pdf.line(startX, y + rowHeight, startX + tableWidth, y + rowHeight);
    
    // Dibujar líneas verticales
    x = startX;
    for (let i = 0; i <= headers.length; i++) {
      if (i === 0) {
        pdf.line(x, y, x, y + rowHeight);
      } else if (i < headers.length) {
        x += colWidths[i-1];
        pdf.line(x, y, x, y + rowHeight);
      } else {
        pdf.line(startX + tableWidth, y, startX + tableWidth, y + rowHeight);
      }
    }
    
    // Restaurar fuente normal si se cambió a negrita
    pdf.setFont("helvetica", "normal");
    
    y += rowHeight;
  });
  
  return y; // Devolver la nueva posición Y
};

// Función principal modularizada para añadir el resumen ejecutivo con tablas
export const addExecutiveSummary = (
  pdf: jsPDF, 
  filtersData: FilterData, 
  reportStats: ReportStats, 
  additionalInfo: AdditionalInfo
) => {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  
  // Añadir encabezado
  addPageHeader(pdf, filtersData);
  
  // Añadir título de resumen ejecutivo
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(60, 60, 60);
  pdf.text("RESUMEN EJECUTIVO", pdfWidth / 2, 100, {
    align: "center",
  });
  
  // Añadir información general como tabla
  let yPosition = 120;
  
  // Tabla para información general
  const infoHeaders = ["Campo", "Valor"];
  const infoData = [
    ["Universidad", additionalInfo.universidad],
    ["Dirección", additionalInfo.direccion],
    ["Departamento", additionalInfo.departamento],
    ["Responsable", additionalInfo.responsable],
    ["Fecha de generación", additionalInfo.fechaGeneracion]
  ];
  
  // Crear tabla de información general
  yPosition = createTable(pdf, infoHeaders, infoData, yPosition, [120, 350]);
  
  // Título para estadísticas
  yPosition += 20;
  yPosition = addSectionTitle(pdf, "ESTADÍSTICAS DE REGISTROS", yPosition);
  
  // Tabla para estadísticas
  const statsHeaders = ["Categoría", "Cantidad"];
  const statsData = [
    ["Registros finalizados", reportStats.registrosFinalizados.toString()],
    ["Registros en proceso", reportStats.registrosEnProceso.toString()],
    ["Registros iniciados", reportStats.registrosInicio.toString()],
    ["Total de registros", reportStats.totalRegistros.toString()]
  ];
  
  // Crear tabla de estadísticas, con la fila de "Total de registros" (índice 3) en negrita
  yPosition = createTable(pdf, statsHeaders, statsData, yPosition, [200, 270], [3]);
  
  // Título para filtros
  yPosition += 20;
  yPosition = addSectionTitle(pdf, "FILTROS APLICADOS", yPosition);
  
  // Tabla para filtros
  const filterHeaders = ["Filtro", "Valor"];
  const filterData = [
    ["Año", filtersData.year || "Todos"],
    ["Facultad", filtersData.facultad || "Todas"],
    ["Estado", filtersData.estado || "Todos"],
    ["Periodo", filtersData.fechaInicio && filtersData.fechaFin ? 
      `Del ${formatDate(filtersData.fechaInicio)} al ${formatDate(filtersData.fechaFin)}` : 
      "Todo el periodo"]
  ];
  
  // Crear tabla de filtros
  createTable(pdf, filterHeaders, filterData, yPosition, [150, 320]);
  
  // Añadir pie de página en la primera página
  addFooter(pdf, 1, additionalInfo);
};

// Función para añadir la sección de observaciones con formato tabular
export const addObservationsPage = (
  pdf: jsPDF, 
  pageNumber: number, 
  filtersData: FilterData, 
  additionalInfo: AdditionalInfo
) => {
  // Add new page
  pdf.addPage();
  
  // Add header to final page
  addPageHeader(pdf, filtersData);
  
  // Añadir sección de observaciones
  let yPosition = 100;
  yPosition = addSectionTitle(pdf, "OBSERVACIONES Y CONCLUSIONES", yPosition);
  
  // Tabla para observaciones
  const obsHeaders = ["Observación"];
  const obsData = [
    ["Este reporte muestra el estado actual de los registros de propiedad intelectual según los filtros aplicados."],
    ["Los datos presentados reflejan la información disponible hasta la fecha de generación del reporte."],
    ["Para más detalles sobre registros específicos, consulte el módulo de gestión de registros en el sistema."],
    ["Las estadísticas de cumplimiento se calculan en base a los registros finalizados contra el total de registros."],
    ["Los gráficos y tablas presentados pueden utilizarse para la toma de decisiones estratégicas."]
  ];
  
  // Crear tabla de observaciones
  yPosition = createTable(pdf, obsHeaders, obsData, yPosition);
  
  // Añadir pie de página en la página final
  addFooter(pdf, pageNumber, additionalInfo);
};

// Función para generar nombre de archivo
export const generateFileName = (filtersData: FilterData) => {
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

// Función completa para generar el PDF
export const generatePDF = (filtersData: FilterData, reportStats: ReportStats, additionalInfo: AdditionalInfo) => {
  // Crear nuevo documento PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4"
  });
  
  // Añadir resumen ejecutivo (primera página)
  addExecutiveSummary(pdf, filtersData, reportStats, additionalInfo);
  
  // Añadir página de observaciones (última página)
  addObservationsPage(pdf, 2, filtersData, additionalInfo);
  
  // Generar nombre de archivo y guardar/descargar
  const fileName = generateFileName(filtersData);
  pdf.save(fileName);
  
  return fileName;
};