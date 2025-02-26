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
import { CardProps } from "./interfaces/cardprops.interface";

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  barChartData,
  pieChartData,
  pieChartColors = ["#8884d8", "#82ca9d", "#ff8042"],
}) => {
  return (
    <div className={`bg-white rounded-lg w-full h-180 p-2 ${className}`}>
      <div className="space-y-1">
        {children} {/* Contenido adicional */}

        {/* Gráfico de Barras */}
        {barChartData && (
          <div className="mt-1">
            <h3 className="text-lg font-semibold mb-1 text-center">
              Solicitudes por Productos
            </h3>
            <ResponsiveContainer width="100%" height={260}>
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
            <h3 className="text-xn font-semibold mb-2 text-center">
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
                  outerRadius={40}
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