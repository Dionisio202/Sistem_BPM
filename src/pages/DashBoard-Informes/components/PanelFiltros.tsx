import React, { useState, useCallback, useEffect, useRef } from "react";
import { FilterPanelProps, Filters } from "./interfaces/filters.interface";

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
  
  // Estados para los buscadores
  const [facultadSearch, setFacultadSearch] = useState("");
  const [carreraSearch, setCarreraSearch] = useState("");
  
  // Filtrar facultades y carreras según la búsqueda
  const filteredFacultades = facultades.filter(facultad => 
    facultad.toLowerCase().includes(facultadSearch.toLowerCase())
  );
  
  const filteredCarreras = carreras.filter(carrera => 
    carrera.toLowerCase().includes(carreraSearch.toLowerCase())
  );
  
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

          // Crear el nuevo estado basado en el valor actual
          const newState = {
            ...prevFilters,
            [key]: isChecked
              ? [...prevValue, value]
              : prevValue.filter((item) => item !== value),
          };

          // Si estamos cambiando facultades y desmarcamos alguna, limpiar sus carreras correspondientes
          if (name === "facultades" && !isChecked) {
            // Carreras que pertenecen a esta facultad
            const carrerasDeFacultad = carreras.filter(carrera => 
              carreras.includes(carrera)
            );

            // Filtrar las carreras que ya no deben estar seleccionadas
            newState.carreras = prevFilters.carreras.filter(carrera => 
              !carrerasDeFacultad.includes(carrera)
            );
          }

          return newState;
        } else if (type === "select-multiple") {
          const selectElement = e.target as HTMLSelectElement;
          const selectedOptions = Array.from(selectElement.selectedOptions).map(
            (option) => option.value
          );

          const newState = { ...prevFilters, [name]: selectedOptions };

          // Si cambiamos facultades, limpiar carreras que ya no pertenecen a facultades seleccionadas
          if (name === "facultades") {
            // Dejamos solo las carreras que pertenecen a las facultades seleccionadas
            newState.carreras = [];
          }

          return newState;
        } else {
          const key = name as keyof Filters;
          return { ...prevFilters, [key]: value };
        }
      });
    },
    [carreras]
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
    // Limpiar también los buscadores
    setFacultadSearch("");
    setCarreraSearch("");
  }, []);

  // Función para seleccionar o deseleccionar todas las facultades filtradas
  const selectAllFacultades = () => {
    isInternalChange.current = true;
    
    // Si todas las facultades filtradas ya están seleccionadas, deseleccionamos todas
    const allSelected = filteredFacultades.every(facultad => 
      filters.facultades.includes(facultad)
    );
    
    if (allSelected) {
      // Deseleccionar todas las facultades filtradas
      setFilters(prev => ({
        ...prev,
        facultades: prev.facultades.filter(facultad => 
          !filteredFacultades.includes(facultad)
        ),
        // Limpiar también las carreras asociadas
        carreras: []
      }));
    } else {
      // Seleccionar todas las facultades filtradas
      const newFacultades = [...new Set([...filters.facultades, ...filteredFacultades])];
      setFilters(prev => ({
        ...prev,
        facultades: newFacultades
      }));
    }
  };

  // Función para seleccionar o deseleccionar todas las carreras filtradas
  const selectAllCarreras = () => {
    isInternalChange.current = true;
    
    // Si todas las carreras filtradas ya están seleccionadas, deseleccionamos todas
    const allSelected = filteredCarreras.every(carrera => 
      filters.carreras.includes(carrera)
    );
    
    if (allSelected) {
      // Deseleccionar todas las carreras filtradas
      setFilters(prev => ({
        ...prev,
        carreras: prev.carreras.filter(carrera => 
          !filteredCarreras.includes(carrera)
        )
      }));
    } else {
      // Seleccionar todas las carreras filtradas
      const newCarreras = [...new Set([...filters.carreras, ...filteredCarreras])];
      setFilters(prev => ({
        ...prev,
        carreras: newCarreras
      }));
    }
  };

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

        {/* Facultades con buscador */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Facultades</h3>
          
          {/* Buscador de facultades */}
          <div className="mb-2">
            <input
              type="text"
              value={facultadSearch}
              onChange={(e) => setFacultadSearch(e.target.value)}
              placeholder="Buscar facultad..."
              className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Botón para seleccionar/deseleccionar todas */}
          <button 
            onClick={selectAllFacultades}
            className="mb-2 text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            {filteredFacultades.every(f => filters.facultades.includes(f)) 
              ? "Deseleccionar todas" 
              : "Seleccionar todas"}
          </button>
          
          {/* Lista de facultades con scroll */}
          <div className="max-h-36 overflow-y-auto border border-gray-300 rounded-md">
            {filteredFacultades.length > 0 ? (
              filteredFacultades.map((facultad) => (
                <label key={facultad} className="flex items-center text-gray-700 p-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="facultades"
                    value={facultad}
                    checked={filters.facultades.includes(facultad)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {facultad}
                </label>
              ))
            ) : (
              <p className="text-gray-500 p-2">No se encontraron facultades</p>
            )}
          </div>
        </div>

        {/* Carreras con buscador */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Carreras</h3>
          
          {/* Buscador de carreras */}
          <div className="mb-2">
            <input
              type="text"
              value={carreraSearch}
              onChange={(e) => setCarreraSearch(e.target.value)}
              placeholder="Buscar carrera..."
              className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Botón para seleccionar/deseleccionar todas */}
          <button 
            onClick={selectAllCarreras}
            className="mb-2 text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            {filteredCarreras.every(c => filters.carreras.includes(c)) 
              ? "Deseleccionar todas" 
              : "Seleccionar todas"}
          </button>
          
          {/* Lista de carreras con scroll */}
          <div className="max-h-36 overflow-y-auto border border-gray-300 rounded-md">
            {filteredCarreras.length > 0 ? (
              filteredCarreras.map((carrera) => (
                <label key={carrera} className="flex items-center text-gray-700 p-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="carreras"
                    value={carrera}
                    checked={filters.carreras.includes(carrera)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {carrera}
                </label>
              ))
            ) : (
              <p className="text-gray-500 p-2">No se encontraron carreras</p>
            )}
          </div>
        </div>
      </div>

      {/* Botón para limpiar filtros */}
      <div className="mt-6 justify-center flex">
        <button
          onClick={clearAllFilters}
          className="bg-red-600 text-white px-4 py-2 rounded w-2xs hover:bg-red-700 transition-colors justify-center"
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