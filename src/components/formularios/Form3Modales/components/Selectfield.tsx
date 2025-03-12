interface SelectFieldProps {
  label: string;
  value: string | number; // Permitir string o number
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string | number; label: string }[]; // Permitir string o number
  disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
}) => (
  <div>
    <label className="block text-xs font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="mt-1 text-xs block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
    >
      <option value="">Seleccione una opción</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
