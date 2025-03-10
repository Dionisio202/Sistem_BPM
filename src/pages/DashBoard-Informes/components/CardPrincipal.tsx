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
  stackedBarChartData,
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
              Registros por Facultad
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
        {/* Gráfico de Barras Horizontales Apilado */}
        {stackedBarChartData && (
          <div className="mt-1">
            <h3 className="text-lg font-semibold mb-1 text-center">
              Distribución de Tipos de Proyecto por Tipos de Producto
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={stackedBarChartData}
                layout="vertical" // Hace que el gráfico sea horizontal
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Legend />
                {/* Barras apiladas */}
                <Bar dataKey="value1" stackId="a" fill="#8884d8" />
                <Bar dataKey="value2" stackId="a" fill="#82ca9d" />
                <Bar dataKey="value3" stackId="a" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {/* Gráfico de Pie */}
        {pieChartData && (
          <div className="mt-1">
            <h3 className="text-lg font-semibold mb-1 text-center">
              Distribución de Registros
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={pieChartColors[index % pieChartColors.length]}
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
