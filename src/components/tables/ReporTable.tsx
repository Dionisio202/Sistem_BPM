import React from "react";
import { FaEdit, FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Definir la interfaz para los objetos report
interface Report {
  id: number;
  name: string;
  period: string;
  file: string;
}

// Definir las propiedades del componente para recibir filtros
interface ReportTableProps {
  filters: string[];
}

const ReportTable: React.FC<ReportTableProps> = React.memo(({ filters }) => {
  // Reportes de ejemplo
  const reports: Report[] = [
    { id: 1, name: "Reporte_Trimestre1", period: "T1", file: "/sample.pdf" },
    { id: 2, name: "Reporte_Trimestre2", period: "T2", file: "/sample.pdf" },
    { id: 3, name: "Reporte_Trimestre3", period: "T3", file: "/sample.pdf" },
    { id: 4, name: "Reporte_Trimestre4", period: "T4", file: "/sample.pdf" },
  ];

  const navigate = useNavigate(); // Declarar useNavigate aquí

  // Función para filtrar los reportes según los filtros seleccionados
  const filteredReports = reports.filter((report) =>
    filters.length > 0 ? filters.includes(report.period) : true
  );

  // Tipo explícito para el parámetro 'report' que es de tipo 'Report'
  // @ts-ignore
  const handleEdit = (report: Report) => {
    navigate(`/ReporteEditor`, { state: { report } }); // Redirigir al hacer clic en editar y pasar el reporte
  };

  const handleDownload = (report: Report) => {
    const link = document.createElement("a");
    link.href = report.file;
    link.download = report.name + ".pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-300">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-[#931D21] text-white text-sm font-semibold">
            <th className="px-6 py-3 text-left text-sm font-medium">Nombre</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Periodo</th>
            <th className="px-2 py-3 text-left text-sm font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.map((report) => (
            <tr key={report.id} className="border-t hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium">{report.name}</td>
              <td className="px-6 py-4 text-sm font-medium">{report.period}</td>
              <td className="px-2 py-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(report)} // Redirigir al hacer clic en editar
                  className="text-yellow-500 hover:text-yellow-700"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDownload(report)}
                  className="text-green-500 hover:text-green-700"
                >
                  <FaDownload />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default ReportTable;
