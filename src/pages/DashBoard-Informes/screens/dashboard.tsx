import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CardPrincipal from "../components/CardPrincipal";
import PanelFiltros from "../components/PanelFiltros";
import HorizontalBar from "../components/HorizontalBarComponent";
import TaskProgressCard from "../components/TaskProgressCard";
import GanttChart from "../components/GanttComponent";
import NumericCards from "../components/RecordNumber";
import PDFExport from "../components/PDFExport";
import io from "socket.io-client";
import { SERVER_BACK_URL } from "../../../config";
const socket = io(SERVER_BACK_URL);

const Dashboard: React.FC = () => {
  //Datos para los graficos
  //ojo para el back aqui se deberia cargar con la sentencia sql
  const barChartData = [
    { name: "R.Obras", value: 10 },
    { name: "R.Software", value: 20 },
    { name: "R.Fonogramas", value: 1 },
    { name: "R.Fonogramas", value: 5 },
    { name: "R.Fonogramas", value: 6 },
    { name: "R.Fonogramas", value: 2 },
  ];

  // Datos para el gráfico de torta
  const pieChartData = [
    { name: "Culminados", value: 10 },
    { name: "En Progreso", value: 20 },
    { name: "No Culminados", value: 10 },
  ];

  // Colores personalizados para el gráfico de torta
  const pieChartColors = ["#8884d8", "#82ca9d", "#ff8042"];
  const [tasks, setTasks] = useState<any[]>([]);


  // Files data to pass to the GanttChart component
// En tu componente Dashboard
useEffect(() => {
  socket.emit("obtener_tareas_gantt", {}, (response:any) => {
    if (response.success) {
      setTasks(response.data);
    } else {
      console.error("Error al obtener tareas para Gantt:", response.message);
    }
  });
}, []);

  // record numerico, card para los conteos generales del dashboard
  const records = [
    { label: "Casos", value: 120 },
    { label: "Año", value: 2025 },
    { label: "Informes", value: 1 },
  ];

  return (
    <PDFExport captureIds={["taskProgress"]}>
    <div className="flex flex-col min-h-screen">
      <div className="flex">
        <Sidebar />
        <main className="flex-grow p-1 space-y-2 ml-0 md:ml-60">
          <div className="flex gap-1 items-center">
            <div className="flex-3">
              <TaskProgressCard
                completedTasks={7}
                totalTasks={10}
                nameTasks={"Caso 2001 / Registro Propiedad Intelectual"}
              />
            </div>
            <div className="flex-2">
              <NumericCards records={records} />
            </div>
          </div>

          <div className="flex justify-end bg-gray-200 p-3 rounded-lg">
            <div className="flex-9" id="taskProgress">
              <HorizontalBar />
            </div>
            <CardPrincipal
              title="Panel General"
              className="w-full md:w-[calc(45%-1rem)] lg:w-[calc(50.33%-8rem)] text-center text-sm border border-gray-300 bg-gray-800 rounded-lg p-4 shadow-sm"
              barChartData={barChartData}
              pieChartData={pieChartData}
              pieChartColors={pieChartColors}
            ></CardPrincipal>
            <PanelFiltros />
          </div>
          <div className="p-3">
            <GanttChart tasks={tasks} />
          </div>
        </main>
      </div>
    </div>
    </PDFExport>
  );
};

export default Dashboard;