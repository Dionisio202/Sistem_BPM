// PDFExport.tsx
import React, { ReactNode } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import logo from '../../../assets/img/logoUTA.png'; 

interface PDFExportProps {
  children: ReactNode;
  captureIds: string[];
}

const PDFExport: React.FC<PDFExportProps> = ({ children, captureIds }) => {
  const exportToPDF = async () => {
    const pdf = new jsPDF('p', 'pt', 'a4'); // 'pt' para puntos, 'a4' tamaño de la página
    const pdfWidth = pdf.internal.pageSize.getWidth();  // ancho de la página en puntos

    // === 1) Agregas el encabezado (texto e imagen, si deseas) en la primera página
    // ----------------------------------------------------------
    // Ejemplo: Añadir un logo en la esquina superior izquierda
    // Ajusta x, y, width y height según tus necesidades
    // Si tu imagen está en base64, la puedes colocar directamente
    pdf.addImage(logo, 'PNG', 40, 15, 60, 60);

    // Luego, agregas texto
    pdf.setFontSize(14);
    pdf.setTextColor(60, 60, 60);
    pdf.text('DIRECCION DE INNOVACION Y EMPRENDIMIENTO', pdfWidth / 2, 40, {
      align: 'center',
    });

    pdf.setFontSize(12);
    pdf.text('REPORTE DE REGISTRO DE PROPIEDAD INTELECTUAL', pdfWidth / 2, 60, {
      align: 'center',
    });

    // Dibujar una línea horizontal para separar
    pdf.setDrawColor(60, 60, 60); // color de la línea
    pdf.setLineWidth(0.5);
    pdf.line(40, 70, pdfWidth - 40, 70); // (x1, y1, x2, y2)

    // === 2) Ahora, debajo del encabezado, vas iterando y añadiendo el contenido capturado
    // ----------------------------------------------------------
    // Para evitar que se “pise” con el encabezado, podrías
    // iniciar la imagen un poco más abajo (por ejemplo, y=100)

    const startY = 100;  // posición vertical de inicio
    let currentPage = 0; // para saber cuándo agregar página

    for (let i = 0; i < captureIds.length; i++) {
      const element = document.getElementById(captureIds[i]);
      if (element) {
        // Capturamos el contenido con html2canvas
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        // Calculamos un ancho de imagen que se ajuste al PDF
        // y alto proporcional
        const desiredWidth = 300
        const desiredHeight = 300;

        // Si i > 0, añadimos una nueva página
        if (i > 0) {
          pdf.addPage();
          currentPage++;
          // En cada nueva página, si deseas repetir el encabezado, puedes volver a dibujarlo:
          pdf.setFontSize(14);
          pdf.setTextColor(60, 60, 60);
          pdf.text('DIRECCION DE INNOVACION Y EMPRENDIMIENTO', pdfWidth / 2, 40, {
            align: 'center',
          });
          pdf.setFontSize(12);
          pdf.text('REPORTE DE REGISTRO DE PROPIEDAD INTELECTUAL', pdfWidth / 2, 60, {
            align: 'center',
          });
          pdf.setDrawColor(60, 60, 60);
          pdf.setLineWidth(0.5);
          pdf.line(40, 70, pdfWidth - 40, 70);
        }

        // Agregar la imagen en la posición (x=40, y=startY) para dejar margen
        pdf.addImage(imgData, 'PNG', 160, startY, desiredWidth, desiredHeight);
      }
    }

    // === 3) Guardar el PDF con el nombre que quieras
    // ----------------------------------------------------------
    pdf.save('dashboard.pdf');
  };

  return (
    <div>
      {children}
      <button
        onClick={exportToPDF}
        style={{
          backgroundColor: '#007bff',
          color: '#fff',
          padding: '10px 20px',
          fontSize: '16px',
          margin: '20px auto',
          display: 'block',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
      >
        Exportar a PDF
      </button>
    </div>
  );
};

export default PDFExport;
