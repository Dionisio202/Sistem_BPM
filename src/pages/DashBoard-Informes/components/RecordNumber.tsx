import React from "react";
import { FiBox } from "react-icons/fi";

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
  icon?: React.ReactNode;
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

// Componente para las categorías de proyectos - rediseñado
const CategoryCard: React.FC<ProjectCategory> = ({ name, count, icon }) => {
  return (
    <div className="bg-gray-700 text-white rounded-lg shadow-md flex flex-col items-center justify-center p-4 w-36">
      <div className="text-center">
        {icon || <FiBox className="text-2xl mx-auto" />}
        <p className="text-2xl font-bold mt-1">{count}</p>
        <p className="text-xs mt-1">{name}</p>
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
    <div className="p-4 flex flex-wrap gap-6">
      {/* Tarjeta principal */}
      <CardComponent {...cardsData[0]} />

      {/* Estado de registros */}
      <div className="grid grid-cols-1 gap-3">
        {smallCardsData.map((card, index) => (
          <SmallCardComponent key={index} {...card} />
        ))}
      </div>

      {/* Total de proyectos */}
      <div className="bg-[#0a0a2a] text-white p-6 rounded-xl w-64 shadow-lg flex items-center justify-center">
        <h3 className="text-lg font-semibold">Total de Proyectos :</h3>
      </div>

      {/* Categorías de proyectos - CORREGIDO */}
      <div className="flex gap-4">
        {projectCategories.map((item) => (
          <CategoryCard key={item.name} {...item} />
        ))}
      </div>

      
    </div>
  );
};

export default DashboardCards;