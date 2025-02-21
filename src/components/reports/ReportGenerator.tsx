import React from "react";

const ReportGenerator: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded shadow border">
      <h3 className="text-lg font-bold mb-2">Generador de Reportes</h3>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Generar Reporte
      </button>
    </div>
  );
};

export default ReportGenerator;
