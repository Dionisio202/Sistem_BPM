import React from "react";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string; indicador?: number }[];
  disabled?: boolean;
}

// Función para obtener el color de fondo según el indicador
const getBackgroundColor = (indicador?: number): string => {
  if (indicador === 2) return "#f2bca0"; // Naranja
  if (indicador === 0) return "#b4deb6"; // Verde
  if (indicador === 1) return "#f89e9a"; // Rojo
  return "#FFFFFF"; // Blanco (por defecto)
};

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
}) => {
  // Función para obtener la letra según el indicador
  const getLetter = (indicador?: number): string => {
    switch (indicador) {
      case 0:
        return "Producto por Registrar"; // Verde
      case 1:
        return "Producto Registrado"; // Rojo
      case 2:
        return "Producto Editable"; // Naranja
      default:
        return ""; // Sin indicador
    }
  };
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Seleccione una opción</option>
        {options.map((option) => {
          const letter = getLetter(option.indicador); // Obtener la letra correspondiente
          return (
            <option
              key={option.value}
              value={option.value}
              style={{
                backgroundColor: getBackgroundColor(option.indicador), // Fondo de color
                color: "black", // Color del texto
              }}
            >
              {option.label} {letter && `[${letter}]`} {/* Mostrar la letra */}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SelectField;
