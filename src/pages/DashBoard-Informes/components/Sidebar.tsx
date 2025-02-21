import React, { useState } from "react";
import { FaBars, FaChartBar, FaTimes, FaThLarge } from "react-icons/fa";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Botón para abrir el sidebar en móviles */}
      <button
        className="p-3 text-white bg-gray-800 fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menu"
      >
        <FaBars size={20} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">DINNOVA REPORTES</h2>
          <button
            className="md:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menu"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <ul className="mt-4 space-y-2">
          <li>
            <Link
              to="/dashboard"
              className="p-4 hover:bg-gray-700 flex items-center"
              onClick={() => setIsOpen(false)}
              aria-label="Ir a Dashboard"
            >
              <FaThLarge className="mr-3" /> <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/reports"
              className="p-4 hover:bg-gray-700 flex items-center"
              onClick={() => setIsOpen(false)}
              aria-label="Ir a Reportes"
            >
              <FaChartBar className="mr-3" /> <span>Reportes</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
