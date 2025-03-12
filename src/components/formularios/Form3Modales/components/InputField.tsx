interface InputFieldProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
  
  const InputField: React.FC<InputFieldProps> = ({ label, value, onChange }) => (
    <div>
      <label className="block text-xs font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="mt-1 text-xs block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
      />
    </div>
  );

  export default InputField;