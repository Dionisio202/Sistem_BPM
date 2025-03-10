import React from "react";
import { FaDownload } from "react-icons/fa";
import { FiPackage } from "react-icons/fi";

// Tipos para los datos de las tarjetas
interface CardData {
  title: string;
  value: number | string;
  description?: string;
  progress?: number;
  icon?: React.ReactNode;
}

interface SmallCardData {
  title: string;
  value: number | string;
}

interface ProjectCategory {
  name: string;
  count: number;
}

interface DashboardCardsProps {
  cardsData: CardData[]; // Datos para las tarjetas principales
  smallCardsData: SmallCardData[]; // Datos para las tarjetas pequeñas
  projectCategories: ProjectCategory[]; // Datos para las categorías de proyectos
}

// Componente reutilizable para tarjetas principales
const CardComponent: React.FC<CardData> = ({
  title,
  value,
  description,
  progress,
  icon,
}) => {
  return (
    <div className="bg-[#0a0a2a] text-white p-6 rounded-xl w-64 shadow-lg">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-4xl font-bold mt-2">{value}</p>
        {description && <div className="mt-2 text-sm">{description}</div>}
        {progress !== undefined && (
          <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        {icon && <div className="mt-4">{icon}</div>}
      </div>
    </div>
  );
};

// Componente reutilizable para tarjetas pequeñas
const SmallCardComponent: React.FC<SmallCardData> = ({ title, value }) => {
  return (
    <div className="bg-white text-center p-4 rounded-lg w-32 shadow-md">
      <div>
        <p className="text-gray-600">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

const DashboardCards: React.FC<DashboardCardsProps> = ({
  cardsData,
  smallCardsData,
  projectCategories,
}) => {
  return (
    <div className="p-4 bg-gray-100 flex flex-wrap gap-8">
      {/* Tarjeta principal */}
      <CardComponent {...cardsData[0]} />

      {/* Estado de registros */}
      <div className="flex flex-col gap-2">
        {smallCardsData.map((card, index) => (
          <SmallCardComponent key={index} {...card} />
        ))}
      </div>

      {/* Total de proyectos */}
      <CardComponent {...cardsData[1]} />

      {/* Categorías de proyectos */}
      <div className="flex gap-2">
        {projectCategories.map((item) => (
          <div
            key={item.name}
            className="bg-gray-700 text-white p-2 rounded-lg flex flex-col items-center w-32 shadow-md"
          >
            <div className="flex flex-col items-center">
              <FiPackage className="text-2xl" />
              <span className="text-xl font-bold mt-2">{item.count}</span>
              <p className="text-sm">{item.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Botón de descarga */}
      <button className="bg-red-600 text-white p-3 rounded-lg flex items-center mt-2 hover:bg-red-700 transition-colors">
        Descargar Informe <FaDownload className="ml-2" />
      </button>
    </div>
  );
};

export default DashboardCards;