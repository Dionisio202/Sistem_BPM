import React from "react";

interface ModalProps {
  isOpen: boolean; // Indica si el modal está abierto o cerrado
  onClose: () => void; // Función para cerrar el modal
  children: React.ReactNode; // Contenido dinámico del modal
  title?: string; // Título opcional del modal
}

const ModalP: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null; // No renderizar el modal si no está abierto

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 p-6">
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-xl font-bold text-gray-800">{title}</h2>}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="mb-4">{children}</div>

        {/* Pie del Modal (opcional) */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white rounded-lg px-4 py-2 hover:bg-gray-600 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalP;