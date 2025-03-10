
import React, { useState, useCallback } from "react";

interface Filters {
  estado: string;
  proyecto: string[];
  producto: string[];
  funcionario: string;
  facultad: string;
}

interface FilterPanelProps {
  onFilterChange: (filters: Filters) => void;
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<Filters>({
    estado: "Todos",
    proyecto: [],
    producto: [],
    funcionario: "Todos",
    facultad: "Todos",
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;

      setFilters((prevFilters) => {
        if (type === "checkbox") {
          const isChecked = (e.target as HTMLInputElement).checked;
          const key = name as keyof Filters; // 🔹 Asegurar que `name` es una clave válida de `Filters`
          const prevValue = prevFilters[key] as string[]; // 🔹 Ahora TypeScript sabe que `key` es válido

          return {
            ...prevFilters,
            [key]: isChecked
              ? [...prevValue, value] // Agregar al array si está marcado
              : prevValue.filter((item) => item !== value), // Eliminar si se desmarca
          };
        } else {
          const key = name as keyof Filters; // 🔹 Asegurar que `name` es una clave válida de `Filters`
          return { ...prevFilters, [key]: value }; // 🔹 Para select y text inputs
        }
      });
    },
    []
  );

  const applyFilters = useCallback(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <div className="grid grid-cols-5 gap-25">
        {/* Estado de Registros */}
        <FilterSelect
          label="Estado de Registros"
          name="estado"
          value={filters.estado}
          options={["Todos", "Procesado", "Pendiente"]}
          onChange={handleChange}
        />

        {/* Tipo de Proyecto */}
        <FilterCheckboxGroup
          label="Tipo de Proyecto"
          name="proyecto"
          options={["Innovación", "Investigación", "Vinculación"]}
          selectedValues={filters.proyecto}
          onChange={handleChange}
        />

        {/* Tipo de Producto */}
        <FilterCheckboxGroup
          label="Tipo de Producto"
          name="producto"
          options={["Artículo", "Software", "Libro"]}
          selectedValues={filters.producto}
          onChange={handleChange}
        />

        {/* Funcionario */}
        <FilterSelect
          label="Funcionario"
          name="funcionario"
          value={filters.funcionario}
          options={["Todos", "Jimmy", "Fanny"]}
          onChange={handleChange}
        />

        {/* Facultad */}
        <FilterSelect
          label="Facultad"
          name="facultad"
          value={filters.facultad}
          options={["Todos", "Ingeniería", "Ciencias"]}
          onChange={handleChange}
        />
      </div>

      {/* Botón de Aplicar Filtros */}
      <button
        onClick={applyFilters}
        className="mt-4 bg-blue-600 px-4 py-2 rounded w-full hover:bg-blue-700 transition-colors"
      >
        Aplicar Filtros
      </button>
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

function FilterSelect({
  label,
  name,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{label}</h3>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="text-black p-2 rounded w-full"
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
    <div>
      <h3 className="text-lg font-semibold mb-2">{label}</h3>
      <div className="flex flex-col gap-1">
        {options.map((option) => (
          <label key={option} className="flex items-center">
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
