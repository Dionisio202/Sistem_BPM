import React, { useState } from "react";

interface FiltersData {
  year: string;
  facultad: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
}

interface PanelFiltrosProps {
  onFilterChange: (filters: FiltersData) => void;
  onYearChange: (year: string) => void;
}

const PanelFiltros: React.FC<PanelFiltrosProps> = ({ onFilterChange, onYearChange }) => {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedFacultad, setSelectedFacultad] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleApplyFilters = () => {
    const filters = {
      year: selectedYear,
      facultad: selectedFacultad,
      estado: selectedEstado,
      fechaInicio: startDate,
      fechaFin: endDate
    };
    
    onYearChange(selectedYear);
    onFilterChange(filters);
  };

  return (
    <div className="w-55 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Filtros</h2>

      {/* Filtro por Año */}
      <div className="mb-2">
        <label htmlFor="year" className="block text-sm font-medium mb-1">
          Año
        </label>
        <select
          id="year"
          className="w-full p-2 rounded-lg bg-gray-700 text-white"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Selecciona un año</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>
      </div>

      {/* Filtro por Facultad */}
      <div className="mb-2">
        <label htmlFor="facultad" className="block text-sm font-medium mb-1">
          Facultad
        </label>
        <select
          id="facultad"
          className="w-full p-1 rounded-lg bg-gray-700 text-white"
          value={selectedFacultad}
          onChange={(e) => setSelectedFacultad(e.target.value)}
        >
          <option value="">Selecciona una facultad</option>
          <option value="Ingeniería">Ingeniería</option>
          <option value="Medicina">Medicina</option>
          <option value="Derecho">Derecho</option>
        </select>
      </div>

      {/* Filtro por Estado */}
      <div className="mb-2">
        <label htmlFor="estado" className="block text-sm font-medium mb-1">
          Estado
        </label>
        <select
          id="estado"
          className="w-full p-2 rounded-lg bg-gray-700 text-white"
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.target.value)}
        >
          <option value="">Selecciona un estado</option>
          <option value="Culminado">Culminado</option>
          <option value="En Progreso">En Progreso</option>
          <option value="No Culminado">No Culminado</option>
        </select>
      </div>

      {/* Filtro por Rango de Fechas */}
      <div className="mb-7">
        <label htmlFor="startDate" className="block text-sm font-medium mb-1">
          Rango de Fechas
        </label>
        <div className="flex space-x-2">
          <input
            type="date"
            id="startDate"
            className="w-1/2 p-2 rounded-lg bg-gray-700 text-white"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            id="endDate"
            className="w-1/2 p-2 rounded-lg bg-gray-700 text-white"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <button 
        className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        onClick={handleApplyFilters}
      >
        Aplicar Filtros
      </button>
    </div>
  );
};

export default PanelFiltros;