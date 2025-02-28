import React, { useState } from "react";
import * as XLSX from "xlsx";
import { ExportCardProps } from "./interfaces/exportcard.interface";
import PDFGenerator from "./PdfFormato"; // Importar el componente PDFGenerator

const ExportCard: React.FC<ExportCardProps> = ({ filteredData }) => {
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal

  // Exportar a Excel
  const handleExportExcel = () => {
    try {
      if (filteredData.length === 0) {
        alert("No hay datos para exportar.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Datos Filtrados");
      XLSX.writeFile(workbook, "Reporte.xlsx");
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      alert("Hubo un error al exportar a Excel. Por favor, inténtalo de nuevo.");
    }
  };

  // Mostrar datos filtrados en JSON
  const handleShowJSON = () => {
    if (filteredData.length === 0) {
      alert("No hay datos para mostrar.");
      return;
    }

    // Imprimir en la consola
    console.log("Datos filtrados en JSON:", JSON.stringify(filteredData, null, 2));

    // Mostrar el modal
    setShowModal(true);
  };

  // Cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="bg-gray-800 shadow-md rounded-lg p-4 mb-4">
      <p className="text-white">
        TAREAS DE PROPIEDAD INTELECTUAL - GENERACIÓN DE REPORTES
      </p>
      <div className="flex space-x-2 mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleExportExcel}
        >
          Exportar a Excel
        </button>
        <PDFGenerator filteredData={filteredData} />
        <button
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleShowJSON}
        >
          Mostrar JSON
        </button>
      </div>

      {/* Modal para mostrar JSON */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <pre>{JSON.stringify(filteredData, null, 2)}</pre>
            <button
              className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleCloseModal}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportCard;