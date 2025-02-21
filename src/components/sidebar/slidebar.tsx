import React, { useState } from "react";
import {FaTimesCircle, FaFileDownload } from "react-icons/fa"; // Importamos los iconos

interface SidebarProps {
  onFilterChange: (selectedPeriods: string[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onFilterChange }) => {
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(""); // Estado para la acción seleccionada

  // Opciones para el filtro
  const options = [
    { value: "T1", label: "Trimestre 1" },
    { value: "T2", label: "Trimestre 2" },
    { value: "T3", label: "Trimestre 3" },
    { value: "T4", label: "Trimestre 4" },
    { value: "S1", label: "Semestre 1" },
    { value: "S2", label: "Semestre 2" },
    { value: "Anual", label: "Anual" },
  ];

  // Opciones para el combo box de acciones (ahora con los períodos)
  const actionOptions = [
    { value: "T1", label: "Trimestre 1" },
    { value: "T2", label: "Trimestre 2" },
    { value: "T3", label: "Trimestre 3" },
    { value: "T4", label: "Trimestre 4" },
    { value: "S1", label: "Semestre 1" },
    { value: "S2", label: "Semestre 2" },
  ];

  // Función para manejar la selección de períodos
  const handleSelectChange = (period: string) => {
    setSelectedPeriods((prevSelected) => {
      if (period === "Anual") {
        // Si se selecciona "Anual", agregar automáticamente los valores de T1, T2, T3, S1, S2
        if (prevSelected.includes("Anual")) {
          return prevSelected.filter(
            (item) =>
              item !== "Anual" &&
              item !== "T1" &&
              item !== "T2" &&
              item !== "T3" &&
              item !== "T4" &&
              item !== "S1" &&
              item !== "S2"
          );
        }
        return [...prevSelected, "Anual", "T1", "T2", "T3", "T4", "S1", "S2"];
      }

      // Si "Anual" está seleccionado, eliminar "Anual" si se selecciona algún periodo distinto
      if (prevSelected.includes("Anual") && !prevSelected.includes(period)) {
        return prevSelected.filter((item) => item !== "Anual");
      }

      // Si se selecciona otro período, agregarlo o eliminarlo
      if (prevSelected.includes(period)) {
        return prevSelected.filter((item) => item !== period);
      } else {
        return [...prevSelected, period];
      }
    });
  };

  // Limpiar los filtros
  const clearFilters = () => {
    setSelectedPeriods([]); // Vaciar las selecciones
    setIsOpen(false); // Cerrar el menú desplegable
  };

  // Notificar al componente principal cuando cambian los filtros
  React.useEffect(() => {
    onFilterChange(selectedPeriods);
  }, [selectedPeriods, onFilterChange]);

  // Función para manejar la acción seleccionada
  const handleActionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAction(event.target.value);
  };

  return (
    <aside className="w-full sm:w-1/4 border-b-cyan-100 shadow-lg p-6 border-r border-gray-500 rounded-lg space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Periodo</h2>

      <div>
        {/* Botón para desplegar o contraer el filtro */}
        <button
          className="w-full p-2 bg-gray-100 text-left rounded-lg shadow-md hover:bg-gray-200 mb-4 transition-all duration-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Cerrar Filtro" : "Seleccionar Periodos"}
        </button>

        {/* Menú desplegable */}
        <div
          className={`${
            isOpen ? "max-h-96" : "max-h-0"
          } overflow-hidden transition-all duration-300 ease-in-out`}
        >
          <div className="space-y-2">
            {options.map((period) => (
              <label key={period.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-300"
                  checked={selectedPeriods.includes(period.value)}
                  onChange={() => handleSelectChange(period.value)}
                />
                <span className="text-gray-700 text-sm">{period.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Botón para limpiar el filtro */}
      <button
        onClick={clearFilters}
        className="w-full p-2 bg-[#931D21] text-white text-sm font-medium rounded-lg shadow-md hover:bg-gray-400 transition duration-300 flex justify-center items-center"
      >
        <FaTimesCircle className="mr-2 w-5 h-5" /> Limpiar Filtro
      </button>

      {/* Separador */}
      <div className="border-t border-gray-300 mt-4" />

      {/* Sección de Generar Reporte */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Generar Reporte</h3>

        {/* Combo Box para seleccionar la acción */}
        <select
          value={selectedAction}
          onChange={handleActionChange}
          className="w-full p-2 border border-gray-300 rounded-lg mb-4 shadow-sm"
        >
          <option value="">Selecciona un periodo</option>
          {actionOptions.map((action) => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>

        {/* Botón para generar el reporte */}
        <button
          disabled={!selectedAction} // Deshabilitar si no hay acción seleccionada
          className={`w-full p-3 ${selectedAction ? "bg-[#931D21]" : "bg-gray-300"} text-white rounded-lg shadow-md hover:bg-[#931D21] transition duration-300 flex justify-center items-center`}
        >
          <FaFileDownload className="mr-2 w-5 h-5" /> Generar Reporte
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
