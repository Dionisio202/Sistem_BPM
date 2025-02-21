// src/components/Checkbox/Checkbox.tsx
import React from 'react';
import { CheckboxProps } from '../../../interfaces/checkbox.interface';

const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  value, 
  onChange 
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
        />
        <label className="font-medium text-gray-700">{label}</label>
      </div>
    </div>
  );
};

export default Checkbox;