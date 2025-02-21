import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logoUTA from "../../assets/img/logoUTA.png";
import DataFetcher from "./DataFetcher";
import { PDFConfig, TableStyles } from "../../interfaces/format.interface";
import { Actividad } from '../../interfaces/actividad.interface';
import { DocumentInterface } from "../../interfaces/document.interface";

interface FormatProps {
  doc?: DocumentInterface | null;
}

const Format: React.FC<FormatProps> = () => {
  const [actividad, setActividad] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Configuración de la tabla PDF
  const pdfConfig: PDFConfig = {
    tableColumn: [
      "Actividad",
      "Indicador",
      "Línea Base",
      "Proyección",
      "T1", "T2", "T3", "T4",
      "Gasto T. Humanos",
      "Gasto B. Capital",
      "Total",
      "Responsable"
    ],
    headStyles: {
      fillColor: [147, 29, 33],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 10
    }
  };

  // Estilos de la tabla UI
  const tableStyles: TableStyles = {
    headerClass: "bg-[#931D21] text-white",
    cellClass: "border px-2 py-1",
    loadingClass: "text-center py-4 text-gray-500",
    errorClass: "text-center py-4 text-red-500"
  };

  const goBack = () => {
    navigate("/GestorDocumento");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Configuración del encabezado
    doc.setFontSize(14);
    doc.text("UNIVERSIDAD TÉCNICA DE AMBATO", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("DIRECCIÓN DE INNOVACIÓN Y EMPRENDIMIENTO", 105, 25, { align: "center" });
    doc.text("PLAN OPERATIVO ANUAL 2025", 105, 30, { align: "center" });

    // Logos
    doc.addImage(logoUTA, "PNG", 10, 5, 40, 40);
    doc.addImage(logoUTA, "PNG", 160, 5, 40, 40);

    // Datos de la tabla
    const tableRows = actividad.map((act) => [
      act.nombre_actividad,
      act.indicador_actividad,
      "0.00",
      act.proyeccion_actividad,
      act.t1, act.t2, act.t3, act.t4,
      `$${act.gastos_t_humanos}`,
      `$${act.gasto_b_capital}`,
      `$${act.total_actividad}`,
      act.responsables.join(", ")
    ]);

    // Generar tabla
    doc.autoTable({
      head: [pdfConfig.tableColumn],
      body: tableRows,
      startY: 40,
      headStyles: pdfConfig.headStyles,
      bodyStyles: pdfConfig.bodyStyles
    });

    doc.save("plan_operativo_anual.pdf");
  };

  return (
    <div className="relative">
      <button
        onClick={goBack}
        className="absolute top-4 left-4 bg-[#931D21] text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600"
      >
        Atrás
      </button>

      <div className="max-w-5xl mx-auto p-6 border shadow-lg">
        {/* Encabezado con logos */}
        <div className="max-w-5xl mx-auto p-6 shadow-lg flex items-center justify-between">
          <img src={logoUTA} alt="Logo UTA" className="h-20 sm:h-40" />
          <div className="text-center flex-grow">
            <h1 className="text-xl sm:text-2xl font-bold">UNIVERSIDAD TÉCNICA DE AMBATO</h1>
            <h2 className="text-lg sm:text-xl font-semibold mt-2">DIRECCIÓN DE INNOVACIÓN Y EMPRENDIMIENTO</h2>
            <h3 className="text-md sm:text-lg font-medium mt-2">PLAN OPERATIVO ANUAL 2025</h3>
          </div>
          <img src={logoUTA} alt="Logo UTA" className="h-20 sm:h-40" />
        </div>

        {/* Tabla de datos */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full border min-w-[1200px]">
            <thead>
              <tr className={tableStyles.headerClass}>
                {pdfConfig.tableColumn.map((header, index) => (
                  <th key={index} className={tableStyles.cellClass}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className={tableStyles.loadingClass}>⌛ Cargando actividad...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={12} className={tableStyles.errorClass}>{error}</td>
                </tr>
              ) : actividad.length > 0 ? (
                actividad.map((act, index) => (
                  <tr key={index} className="text-center">
                    <td className={tableStyles.cellClass}>{act.nombre_actividad}</td>
                    <td className={tableStyles.cellClass}>{act.indicador_actividad}</td>
                    <td className={tableStyles.cellClass}>0.00</td>
                    <td className={tableStyles.cellClass}>{act.proyeccion_actividad}</td>
                    <td className={tableStyles.cellClass}>{act.t1}</td>
                    <td className={tableStyles.cellClass}>{act.t2}</td>
                    <td className={tableStyles.cellClass}>{act.t3}</td>
                    <td className={tableStyles.cellClass}>{act.t4}</td>
                    <td className={tableStyles.cellClass}>${act.gastos_t_humanos}</td>
                    <td className={tableStyles.cellClass}>${act.gasto_b_capital}</td>
                    <td className={tableStyles.cellClass}>${act.total_actividad}</td>
                    <td className={tableStyles.cellClass}>{act.responsables.join(", ")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className={tableStyles.loadingClass}>No hay actividades disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DataFetcher setActividad={setActividad} setLoading={setLoading} setError={setError} />
      
      <button
        onClick={downloadPDF}
        className="absolute h-10 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-800"
      >
        Descargar PDF
      </button>
    </div>
  );
};

export default Format;