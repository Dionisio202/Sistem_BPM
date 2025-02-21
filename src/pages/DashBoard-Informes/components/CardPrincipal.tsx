import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface CardProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  barChartData?: { name: string; value: number }[]; // Datos para el gráfico de barras
  pieChartData?: { name: string; value: number }[]; // Datos para el gráfico de torta
  pieChartColors?: string[]; // Colores personalizados para el gráfico de torta
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = "",
  barChartData,
  pieChartData,
  pieChartColors = ["#8884d8", "#82ca9d", "#ff8042"],
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-lg text-center font-bold mb-4">{title}</h2>
      <div className="space-y-4">
        {children} {/* Contenido adicional */}

        {/* Gráfico de Barras */}
        {barChartData && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-center">
              Solicitudes por Facultad
            </h3>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={barChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de Torta */}
        {pieChartData && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-center">
              Distribución de Estados
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  fill="#8884d8"
                  label
                >
                  {pieChartData.map(({ name }) => (
                    <Cell
                      key={name} // Usamos 'name' como clave en lugar del índice
                      fill={
                        pieChartColors[
                          pieChartData.findIndex((entry) => entry.name === name) %
                            pieChartColors.length
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;