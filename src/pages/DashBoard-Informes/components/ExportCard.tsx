import React from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { ExportCardProps } from "./interfaces/exportcard.interface";


const ExportCard: React.FC<ExportCardProps> = ({ filteredData }) => {
  // Exportar a Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos Filtrados");
    XLSX.writeFile(workbook, "Reporte.xlsx");
  };

  // Exportar a PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Datos Filtrados", 10, 10);
    doc.autoTable({
      head: [Object.keys(filteredData[0])], // Encabezados de la tabla
      body: filteredData.map((row) => Object.values(row)), // Datos de la tabla
    });
    doc.save("Reporte.pdf");
  };

  return (
    <div className="bg-gray-800 shadow-md rounded-lg p-4 mb-4">
        <p className="text-white">
            REGISTRO DE PROPIEDAD INTELECTUAL - GENERACIÓN DE REPORTES
        </p>
      <div className="flex space-x-2 mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleExportExcel}
        >
          Exportar a Excel
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleExportPDF}
        >
          Exportar a PDF
        </button>
      </div>
    </div>
  );
};

export default ExportCard;
