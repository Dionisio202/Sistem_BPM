import React, { useState, useCallback, useEffect, useRef } from "react";

// Definición de tipos
interface Filters {
  estado: string;
  proyecto: string[];
  producto: string[];
  funcionario: string;
  facultades: string[]; // Array para soportar múltiples facultades
  carreras: string[]; 
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
  carreras: string[];
  currentFilters: Filters; // Nueva prop para mantener sincronizados los filtros
}

export default function FilterPanel({
  onFilterChange,
  estados,
  proyectos,
  productos,
  funcionarios,
  facultades,
  carreras,
  currentFilters,
}: FilterPanelProps) {
  const [filters, setFilters] = useState<Filters>({
    estado: "Todos",
    proyecto: [],
    producto: [],
    funcionario: "Todos",
    facultades: [],
    carreras: [], 
    fechaInicio: "",
    fechaFin: "",
  });
  
  // Referencia para prevenir el bucle infinito
  const isInternalChange = useRef(false);
  const prevFiltersRef = useRef<Filters | null>(null);

  // Inicialización y sincronización con currentFilters
  useEffect(() => {
    // Solo actualizar si currentFilters ha cambiado realmente y no es una
    // respuesta a nuestros cambios internos
    if (
      currentFilters && 
      !isInternalChange.current && 
      JSON.stringify(currentFilters) !== JSON.stringify(prevFiltersRef.current)
    ) {
      setFilters(currentFilters);
    }
    
    prevFiltersRef.current = currentFilters;
  }, [currentFilters]);

  // Notificar cambios de filtros
  useEffect(() => {
    // Solo notificar si es un cambio interno y los filtros han cambiado
    if (isInternalChange.current) {
      onFilterChange(filters);
      isInternalChange.current = false;
    }
  }, [filters, onFilterChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      
      // Marcar que este es un cambio iniciado por el usuario
      isInternalChange.current = true;

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

  // Función para limpiar todos los filtros
  const clearAllFilters = useCallback(() => {
    isInternalChange.current = true;
    
    const defaultFilters: Filters = {
      estado: "Todos",
      proyecto: [],
      producto: [],
      funcionario: "Todos",
      facultades: [],
      carreras: [],
      fechaInicio: "",
      fechaFin: "",
    };
    
    setFilters(defaultFilters);
  }, []);

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

        {/* Facultades - Selección múltiple */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Facultades</h3>
          <select
            name="facultades"
            multiple
            value={filters.facultades}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {facultades.map((facultad) => (
              <option key={facultad} value={facultad}>
                {facultad}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Mantén Ctrl para selección múltiple</p>
        </div>

        {/* Carreras - Selección múltiple */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Carreras</h3>
          <select
            name="carreras"
            value={filters.carreras}
            onChange={handleChange}
            multiple
            className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {carreras.map((carrera) => (
              <option key={carrera} value={carrera}>
                {carrera}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Mantén Ctrl para selección múltiple</p>
        </div>
      </div>

      {/* Botón para limpiar filtros */}
      <div className="mt-6">
        <button
          onClick={clearAllFilters}
          className="bg-red-600 text-white px-4 py-2 rounded w-full hover:bg-red-700 transition-colors"
        >
          Limpiar Todos los Filtros
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