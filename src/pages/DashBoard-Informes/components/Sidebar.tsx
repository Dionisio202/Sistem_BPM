import React, { useState, useEffect } from "react";
import { FaBars, FaChartBar, FaTimes, FaThLarge, FaChevronLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  // Ajustar el estado inicial según el tamaño de la pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };
    
    // Ejecutar una vez al montar el componente
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    // Emitir evento para que otros componentes puedan reaccionar
    window.dispatchEvent(
      new CustomEvent('sidebarToggle', { detail: { isOpen: newState } })
    );
  };

  return (
    <div className="relative">
      {/* Botón para abrir el sidebar en móviles */}
      <button
        className="p-3 text-white bg-gray-800 fixed top-4 left-4 z-50 md:hidden"
        onClick={() => {
          setIsOpen(true);
          window.dispatchEvent(
            new CustomEvent('sidebarToggle', { detail: { isOpen: true } })
          );
        }}
        aria-label="Abrir menu"
      >
        <FaBars size={20} />
      </button>

      {/* Botón para colapsar el sidebar en escritorio */}
      <button
        className={`hidden md:flex p-3 text-white bg-gray-800 fixed z-50 transition-all duration-300 ${
          isOpen ? "left-60" : "left-6"
        }`}
        onClick={toggleSidebar}
        aria-label={isOpen ? "Colapsar menú" : "Expandir menú"}
      >
        <FaChevronLeft 
          size={20} 
          className={`transition-transform duration-300 ${isOpen ? "" : "rotate-180"}`} 
        />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-15 bg-gray-900 text-white transform ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        } transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <button
            className="md:hidden"
            onClick={() => {
              setIsOpen(false);
              window.dispatchEvent(
                new CustomEvent('sidebarToggle', { detail: { isOpen: false } })
              );
            }}
            aria-label="Cerrar menu"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <ul className="mt-3 space-y-4">
          <li>
            <Link
              to="/dashboard"
              className="p-4 hover:bg-gray-700 flex items-center"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsOpen(false);
                  window.dispatchEvent(
                    new CustomEvent('sidebarToggle', { detail: { isOpen: false } })
                  );
                }
              }}
              aria-label="Ir a Dashboard"
            >
              <FaThLarge className="mr-1" /> <span></span>
            </Link>
          </li>
          <li>
            <Link
              to="/reports"
              className="p-4 hover:bg-gray-700 flex items-center"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsOpen(false);
                  window.dispatchEvent(
                    new CustomEvent('sidebarToggle', { detail: { isOpen: false } })
                  );
                }
              }}
              aria-label="Ir a Reportes"
            >
              <FaChartBar className="mr-1" /> <span></span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;