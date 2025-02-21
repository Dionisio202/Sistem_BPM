import React from "react";
//import { FaTimesCircle } from "react-icons/fa";
import { FiltersProps } from "../../interfaces/filters.interface";

const Filters: React.FC<FiltersProps> = ({
  documentType,
  handleTypeChange,
  //,clearFilters
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Tipo de Documento
      </h2>

      <div className="space-y-3">
        {Object.keys(documentType).map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={type}
              checked={documentType[type]}
              onChange={() => handleTypeChange(type)}
              className="h-5 w-5 border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor={type} className="text-sm text-gray-600">
              {type}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filters;