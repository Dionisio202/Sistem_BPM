interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string; indicador?: number;}[];
  disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Seleccione una opción</option> {/* Opción por defecto */}
        {options.map((option) => (
          <option key={option.value} value={option.value}       style={{
            backgroundColor: option.indicador === 2 ? "orange" : option.indicador === 0 ? "green" : option.indicador === 1 ? "red" : "white",
            color: "white"
          }}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;