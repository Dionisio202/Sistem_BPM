import React from "react";
import Sidebar from "../components/Sidebar";
import CardPrincipal from "../components/CardPrincipal";
import PanelFiltros from "../components/PanelFiltros";
import HorizontalBar from "../components/HorizontalBarComponent";
import TaskProgressCard from "../components/TaskProgressCard";

const Dashboard: React.FC = () => {
  //Datos para los graficos
  //ojo para el back aqui se deberia cargar con la sentencia sql
  const barChartData = [
    { name: "Ingeniería", value: 400 },
    { name: "Medicina", value: 300 },
    { name: "Derecho", value: 200 },
  ];
  // Datos para el gráfico de torta
  const pieChartData = [
    { name: "Culminados", value: 800 },
    { name: "En Progreso", value: 300 },
    { name: "No Culminados", value: 100 },
  ];

  // Colores personalizados para el gráfico de torta
  const pieChartColors = ["#8884d8", "#82ca9d", "#ff8042"];
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex">
        <Sidebar />
        <main className="flex-grow p-2 space-y-4 ml-0 md:ml-60">
          <div className="flex justify-end bg-gray-200 p-3 rounded-lg">
            <div className="flex-9">
            <TaskProgressCard completedTasks={7} totalTasks={10} nameTasks={"Caso 2001 / Registro Propiedad Intelectual"} />
              <HorizontalBar />
            </div>
            <CardPrincipal
              title="Panel General"
              className="w-full md:w-1/3 "
              barChartData={barChartData}
              pieChartData={pieChartData}
              pieChartColors={pieChartColors}
            >
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Total de Registros</h3>
                <p className="text-2xl font-bold">1,200</p>
              </div>
            </CardPrincipal>
            <PanelFiltros />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
