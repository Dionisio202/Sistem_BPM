import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CardPrincipal from "../components/CardPrincipal";
import HorizontalBar from "../components/HorizontalBarComponent";
import GanttChart from "../components/GanttComponent";
import NumericCards from "../components/RecordNumber";
import PDFExport from "../components/PDFExport";
import Separator from "../components/UI/Separator";
import FilterPanel from "../components/PanelFiltros";
import io from "socket.io-client";
import { SERVER_BACK_URL } from "../../../config";
import TableProducts from "../components/TableProducts";
import { text } from "d3";
import { FiPackage } from "react-icons/fi";
const socket = io(SERVER_BACK_URL);

const Dashboard: React.FC = () => {
  // Datos para los gráficos
  const [tasks, setTasks] = useState<any[]>([]);

  // Datos para el gráfico de barras horizontales (carreras)
  const datos = [
    { key: "Software", value: 100 },
    { key: "TI", value: 70 },
    { key: "Administración", value: 60 },
    { key: "diseño", value: 10 },
  ];

  // Datos para el gráfico de barras (facultades)
  const barChartData = [
    { name: "FDA", value: 10 },
    { name: "FISEI", value: 20 },
    { name: "FCHE", value: 1 },
    { name: "FCS", value: 5 },
    { name: "Fx1", value: 6 },
    { name: "Fx2", value: 2 },
  ];

  // Datos para el gráfico de barras apiladas
  const stackedBarChartData = [
    { name: "R.Obras Literarias", value1: 30, value2: 20, value3: 10 },
    { name: "R.Publicaciones", value1: 40, value2: 10, value3: 15 },
    { name: "R.Obras Artisticas", value1: 20, value2: 30, value3: 25 },
    { name: "R.Software", value1: 20, value2: 30, value3: 25 },
    { name: "R. P Radio", value1: 20, value2: 30, value3: 25 },
    { name: "R. Fonogramas", value1: 20, value2: 30, value3: 25 },
  ];

  // Datos para los filtros
  const datosFiltros = {
    estados: ["En Proceso", "Finalizado"],
    proyectos: ["Investigación", "Vinculación", "Carrera"],
    productos: ["R. Obras Literarias", "Software", "Libro"],
    funcionarios: ["Jimmy", "Fanny"],
    facultades: ["FISEI", "FCHE", "FDA"],
    carreras: [
      "Ingeniería Civil",
      "Ingeniería de Sistemas",
      "Medicina",
      "Derecho",
      "Arquitectura",
    ],
  };

  //Datos para Tabla de Productos
  const columns = [
    {
      header: "N°",
      accessorKey: "number", // Accede a la propiedad "name" de los datos
    },
    {
      header: "Nombre Producto",
      accessorKey: "name", // Accede a la propiedad "name" de los datos
    },
    {
      header: "tipo",
      accessorKey: "description", // Accede a la propiedad "description" de los datos
    },
    {
      header: "Proyecto",
      accessorKey: "category", // Accede a la propiedad "category" de los datos
    },
  ];
  const data = [
    {
      number: 1,
      name: "Software Bpm",
      description: "R.Software",
      category: "Investigación",
    },
    {
      number: 2,
      name: "Mini Pelicula",
      description: "R.Obras Artisticas",
      category: "Vinculación",
    },
    {
      number: 3,
      name: "Libro: Vida en la UTA",
      description: "R. Obras Literarias",
      category: "Carrera",
    },
    {
      number: 4,
      name: "Libro: Vida en la UTA",
      description: "R. Obras Literarias",
      category: "Carrera",
    },
    {
      number: 5,
      name: "Libro: Vida en la UTA",
      description: "R. Obras Literarias",
      category: "Carrera",
    },
    {
      number: 6,
      name: "Libro: Vida en la UTA",
      description: "R. Obras Literarias",
      category: "Carrera",
    },
    {
      number: 7,
      name: "Libro: Vida en la UTA",
      description: "R. Obras Literarias",
      category: "Carrera",
    },
    {
      number: 8,
      name: "Libro: Vida en la UTA",
      description: "R. Obras Literarias",
      category: "Carrera",
    },
    {
      number: 9,
      name: "Libro: Vida en la UTA",
      description: "R. Obras Literarias",
      category: "Carrera",
    },
    {
      number: 10,
      name: "Libro: Vida en la UTA",
      description: "R. Obras Literarias",
      category: "Carrera",
    },
    {
      number: 11,
      name: "Libro: Vida en la UTA",
      description: "R. Obras Literarias",
      category: "Carrera",
    },
  ];

  //datos para mis cards

  const cardsData = [
    {
      title: "Total Usuarios",
      value: 150,
      description: "30% activos",
      progress: 30,
    },
    {
      title: "Total Pedidos",
      value: "500",
      icon: <FiPackage className="text-2xl" />,
    },
  ];

  const smallCardsData = [
    { title: "Completados", value: 120 },
    { title: "Pendientes", value: 30 },
  ];

  const projectCategories = [
    { name: "Vinculación", count: 50 },
    { name: "Investigación", count: 70 },
    { name: "Carrera", count: 30 },
  ];

  // Obtener tareas para el gráfico de Gantt
  useEffect(() => {
    socket.emit("obtener_tareas_gantt", {}, (response: any) => {
      if (response.success) {
        setTasks(response.data);
      } else {
        console.error("Error al obtener tareas para Gantt:", response.message);
      }
    });
  }, []);

  // Manejar cambios en los filtros
  const handleFilterChange = (filters) => {
    console.log("Filtros aplicados:", filters);
  };

  return (
    <PDFExport
      captureIds={["taskProgress"]}
      filtersData={{
        year: "2023",
        facultad: "UTA",
        estado: "ssd",
        fechaInicio: "sdd",
        fechaFin: "dsd",
      }}
    >
      <div className="flex flex-col min-h-screen">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow p-1 space-y-2 ml-0 md:ml-15">
            {/* Filtros */}
            <FilterPanel
              onFilterChange={handleFilterChange}
              estados={datosFiltros.estados}
              proyectos={datosFiltros.proyectos}
              productos={datosFiltros.productos}
              funcionarios={datosFiltros.funcionarios}
              facultades={datosFiltros.facultades}
              carreras={datosFiltros.carreras}
            />

            {/* Tarjetas numéricas */}
            <div className="flex-grow md:ml-15 space-y-2 ml=0">
              <NumericCards
                cardsData={cardsData}
                smallCardsData={smallCardsData}
                projectCategories={projectCategories}
              />
            </div>

            {/* Separador: Distribución de Registros */}
            <Separator title="Distribución de Registros Universidad Técnica de Ambato" />

            {/* Gráficos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-200 p-3 rounded-lg">
              <div>
                <CardPrincipal
                  title="Panel General"
                  className="w-full text-center text-sm border border-gray-300 bg-gray-800 rounded-lg p-4 shadow-sm"
                  barChartData={barChartData}
                  stackedBarChartData={stackedBarChartData}
                />
              </div>
              <div id="taskProgress">
                <HorizontalBar Datos={datos} />
              </div>
            </div>

            {/* Separador: Detalle de Productos */}
            <Separator title="Detalle de Productos" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-200 p-3 rounded-lg">
              <div>
                <TableProducts columns={columns} data={data} />
              </div>
              <div>
              </div>
            </div>

            {/* Separador: Seguimiento de Registros */}
            <Separator title="Seguimiento de Registros" />

            {/* Gráfico de Gantt */}
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
