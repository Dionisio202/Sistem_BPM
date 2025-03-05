import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface PDFGeneratorProps {
  filteredData: any[]; // Ajusta el tipo según tu interfaz de datos
  fileName?: string; // Nombre del archivo PDF (opcional)
  title?: string; // Título del reporte (opcional)
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  filteredData,
  fileName = "Reporte.pdf",
  title = "Reporte de Propiedad Intelectual",
}) => {
  const generatePDF = () => {
    try {
      if (filteredData.length === 0) {
        alert("No hay datos para exportar.");
        return;
      }

      const doc = new jsPDF({
        orientation: "portrait", // Orientación vertical
        unit: "mm",
        format: "a4",
      });

      // Encabezado
      const header = () => {
        doc.setFontSize(18);
        doc.setTextColor(41, 128, 185); // Color azul
        doc.setFont("helvetica", "bold");
        doc.text(title, 15, 20);
        doc.setFontSize(12);
        doc.setTextColor(100); // Color gris
        doc.text("Fecha: " + new Date().toLocaleDateString(), 15, 28);
      };

      // Pie de página
      const footer = () => {
        const pageCount = doc.getNumberOfPages(); // Obtener el número total de páginas
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.setTextColor(100); // Color gris
          doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.width - 40,
            doc.internal.pageSize.height - 10
          );
        }
      };

      // Agregar encabezado
      header();

      // Posición inicial para el contenido
      let startY = 40; // Debajo del encabezado

      // Recorrer cada registro y agregarlo al PDF
      filteredData.forEach((record, index) => {
        // Título del registro
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); // Color negro
        doc.setFont("helvetica", "bold");
        doc.text(`Registro ${index + 1}`, 15, startY);

        // Datos del registro
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0); // Color negro
        doc.setFont("helvetica", "normal");

        let rowY = startY + 10; // Posición inicial para los datos

        // Recorrer cada campo del registro
        Object.entries(record).forEach(([key, value]) => {
          doc.text(`${key}:`, 15, rowY); // Nombre del campo
          doc.text(`${value}`, 50, rowY); // Valor del campo
          rowY += 7; // Espaciado entre filas
        });

        startY = rowY + 10; // Espaciado entre registros

        // Agregar una nueva página si el contenido excede el espacio
        if (startY > doc.internal.pageSize.height - 20) {
          doc.addPage();
          startY = 20; // Reiniciar la posición Y
          header(); // Agregar encabezado en la nueva página
        }
      });

      // Agregar pie de página
      footer();

      // Guardar el PDF
      doc.save(fileName);
    } catch (error) {
      console.error("Error al exportar a PDF:", error);
      alert("Hubo un error al exportar a PDF. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <button
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      onClick={generatePDF}
    >
      Exportar a PDF
    </button>
  );
};

export default PDFGenerator;