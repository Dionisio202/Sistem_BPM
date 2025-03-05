import React from "react";
import Sidebar from "../components/Sidebar";
import CardPrincipal from "../components/CardPrincipal";
import PanelFiltros from "../components/PanelFiltros";
import HorizontalBar from "../components/HorizontalBarComponent";
import TaskProgressCard from "../components/TaskProgressCard";
import GanttChart from "../components/GanttComponent";
import NumericCards from "../components/RecordNumber";
import PDFExport from "../components/PDFExport";
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

  // tareas para cargar al diagrama de gannt
  const tasks = [
    {
      id: "1",
      name: "Caso 2002",
      startDate: new Date(2023, 9, 1), // 1 de Octubre de 2023
      endDate: new Date(2023, 9, 5), // 5 de Octubre de 2023
      progress: 60,
      status: "En progreso",
      subtasks: [
        {
          id: "1.1",
          name: "Asesoria para Registro de Propiedad Intelectual",
          startDate: new Date(2023, 9, 1),
          endDate: new Date(2023, 9, 3),
          progress: 80,
          status: "Completado",
        },
        {
          id: "1.2",
          name: "Atención de Solicitud de Registro de Propiedad Intelectual",
          startDate: new Date(2023, 9, 3),
          endDate: new Date(2023, 9, 5),
          progress: 40,
          status: "En progreso",
        },
      ],
    },
    {
      id: "2",
      name: "Caso 2003",
      startDate: new Date(2023, 9, 3), // 3 de Octubre de 2023
      progress: 30,
      status: "En Progreso",
      subtasks: [
        {
          id: "1.1",
          name: "Asesoria de Registro de Propiedad Intelectual",
          startDate: new Date(2023, 9, 1),
          progress: 80,
          status: "Completado",
        },
        {
          id: "1.2",
          name: "Atención de Solicitud de Registro de Propiedad Intelectual",
          startDate: new Date(2023, 9, 3),
          progress: 40,
          status: "Completado",
        },
        {
          id: "1.3",
          name: "Solicitud de Certificación Presupuestaria",
          startDate: new Date(2023, 9, 3),
          progress: 40,
          status: "En Progreso",
        },
      ],
    },
  ];
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
            <div  className="flex-3">
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