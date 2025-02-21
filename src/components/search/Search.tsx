import React from "react";
import { SearchProps } from "../../interfaces/search.interface";

const Search: React.FC<SearchProps> = ({ search, setSearch, year, setYear }) => {
  return (
    <div className="col-span-9 flex flex-col">
      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-400 rounded-lg p-2 flex-1"
        />
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border border-gray-400 rounded-lg p-2"
        >
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>
      </div>
    </div>
  );
};

export default Search;