import React from "react";

const Separator: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="w-full bg-gray-800 py-1 my-8"> {/* Fondo y padding */}
      <div className="flex items-center w-full max-w-4xl mx-auto"> {/* Contenedor centrado y con ancho máximo */}
        {/* Línea izquierda */}
        <div className="flex-grow border-t-2 border-gray-300"></div> {/* Línea más gruesa */}
        {/* Título */}
        <span className="mx-6 text-xn font-light text-white">{title}</span> {/* Título más grande */}
        {/* Línea derecha */}
        <div className="flex-grow border-t-2 border-gray-300"></div> {/* Línea más gruesa */}
      </div>
    </div>
  );
};

export default Separator;