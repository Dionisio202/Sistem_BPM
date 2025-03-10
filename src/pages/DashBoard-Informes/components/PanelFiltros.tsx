import React, { useState, useCallback } from "react";

// Definición de tipos
interface Filters {
  estado: string;
  proyecto: string[];
  producto: string[];
  funcionario: string;
  facultad: string;
  carreras: string[]; // Nuevo campo para carreras
  fechaInicio: string;
  fechaFin: string;
}

interface FilterPanelProps {
  onFilterChange: (filters: Filters) => void;
  estados: string[];
  proyectos: string[];
  productos: string[];
  funcionarios: string[];
  facultades: string[];
  carreras: string[]; // Nuevo prop para carreras
}

export default function FilterPanel({
  onFilterChange,
  estados,
  proyectos,
  productos,
  funcionarios,
  facultades,
  carreras,
}: FilterPanelProps) {
  const [filters, setFilters] = useState<Filters>({
    estado: "Todos",
    proyecto: [],
    producto: [],
    funcionario: "Todos",
    facultad: "Todos",
    carreras: [], // Inicialmente vacío
    fechaInicio: "",
    fechaFin: "",
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;

      setFilters((prevFilters) => {
        if (type === "checkbox") {
          const isChecked = (e.target as HTMLInputElement).checked;
          const key = name as keyof Filters;
          const prevValue = prevFilters[key] as string[];

          return {
            ...prevFilters,
            [key]: isChecked
              ? [...prevValue, value]
              : prevValue.filter((item) => item !== value),
          };
        } else if (type === "select-multiple") {
          const selectElement = e.target as HTMLSelectElement;
          const selectedOptions = Array.from(selectElement.selectedOptions).map(
            (option) => option.value
          );
          return { ...prevFilters, [name]: selectedOptions };
        } else {
          const key = name as keyof Filters;
          return { ...prevFilters, [key]: value };
        }
      });
    },
    []
  );

  const applyFilters = useCallback(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full">
      {/* Contenedor de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Estado de Registros */}
        <div>
          <FilterSelect
            label="Estado de Registros"
            name="estado"
            value={filters.estado}
            options={["Todos", ...estados]}
            onChange={handleChange}
          />
          {/* Filtro de fechas */}
          <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Rango de Fechas</h3>
            <div className="flex flex-col gap-2">
              <input
                type="date"
                name="fechaInicio"
                value={filters.fechaInicio}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="fechaFin"
                value={filters.fechaFin}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tipo de Proyecto */}
        <FilterCheckboxGroup
          label="Tipo de Proyecto"
          name="proyecto"
          options={proyectos}
          selectedValues={filters.proyecto}
          onChange={handleChange}
        />

        {/* Tipo de Producto */}
        <FilterCheckboxGroup
          label="Tipo de Producto"
          name="producto"
          options={productos}
          selectedValues={filters.producto}
          onChange={handleChange}
        />

        {/* Funcionario */}
        <FilterSelect
          label="Funcionario"
          name="funcionario"
          value={filters.funcionario}
          options={["Todos", ...funcionarios]}
          onChange={handleChange}
        />

        {/* Facultad */}
        <FilterSelect
          label="Facultad"
          name="facultad"
          value={filters.facultad}
          options={["Todos", ...facultades]}
          onChange={handleChange}
        />

        {/* Carreras */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Carreras</h3>
          <select
            name="carreras"
            value={filters.carreras}
            onChange={handleChange}
            multiple // Permite selección múltiple
            className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {carreras.map((carrera) => (
              <option key={carrera} value={carrera}>
                {carrera}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botón de Aplicar Filtros */}
      <div className="mt-6">
        <button
          onClick={applyFilters}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition-colors"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
}

// Componente reutilizable para selects
interface FilterSelectProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

function FilterSelect({ label, name, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{label}</h3>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

// Componente reutilizable para grupos de checkboxes
interface FilterCheckboxGroupProps {
  label: string;
  name: string;
  options: string[];
  selectedValues: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FilterCheckboxGroup({
  label,
  name,
  options,
  selectedValues,
  onChange,
}: FilterCheckboxGroupProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{label}</h3>
      <div className="flex flex-col gap-1">
        {options.map((option) => (
          <label key={option} className="flex items-center text-gray-700">
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={selectedValues.includes(option)}
              onChange={onChange}
              className="mr-2"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}