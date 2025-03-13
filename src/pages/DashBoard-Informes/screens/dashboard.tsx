import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import CardPrincipal from "../components/CardPrincipal";
import HorizontalBar from "../components/HorizontalBarComponent";
import GanttChart from "../components/GanttComponent";
import NumericCards from "../components/RecordNumber";
import PDFExport from "../components/PDFExport";
import Separator from "../components/UI/Separator";
import FilterPanel from "../components/PanelFiltros";
import TableProducts from "../components/TableProducts";
import { FiPackage } from "react-icons/fi";
import {Filters, ProductCard} from "../components/interfaces/dashboard.interface";
import { useDashboardData } from "../components/hooks/useDashboardData";
import { generarDatosGraficos, prepararDatosGantt, prepararDatosTabla, prepararTarjetasProductos } from "../components/hooks/dataUtils";

const ProductTypeCard: React.FC<ProductCard> = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="bg-blue-100 p-3 rounded-full">
        {icon || <FiPackage className="h-6 w-6 text-blue-500" />}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  // Usar el hook personalizado para cargar los datos
  const { 
    todosRegistros, 
    registrosFiltrados, 
    setRegistrosFiltrados,
    datosFiltros,
    carrerasFiltradas,
    setCarrerasFiltradas
  } = useDashboardData();
  
  // Estado para los filtros actuales
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    estado: "Todos",
    proyecto: [],
    producto: [],
    funcionario: "Todos",
    facultades: [],
    carreras: [],
    fechaInicio: "",
    fechaFin: "",
  });

  // Aplicar filtros a los datos
 // Modificar la función applyFilters para incluir el manejo específico de carreras
const applyFilters = (filters: Filters) => {
  let registrosFiltrados = todosRegistros.filter(registro => {
    // Filtro por estado
    if (filters.estado !== "Todos" && registro.estado !== filters.estado) {
      return false;
    }

    // Filtro por proyecto
    if (filters.proyecto.length > 0 && !filters.proyecto.includes(registro.tipoProyecto)) {
      return false;
    }

    // Filtro por producto
    if (filters.producto.length > 0 && !filters.producto.includes(registro.tipoProducto)) {
      return false;
    }

    // Filtro por funcionario
    if (filters.funcionario !== "Todos" && registro.funcionario !== filters.funcionario) {
      return false;
    }

    // Filtro por fecha
    if (filters.fechaInicio || filters.fechaFin) {
      const fechaFinRegistro = new Date(registro.fechaFin);
      
      // Si hay fecha de inicio en el filtro
      if (filters.fechaInicio) {
        const startDate = new Date(filters.fechaInicio);
        if (fechaFinRegistro < startDate) {
          return false; // El registro finaliza antes del período de filtro
        }
      }
      
      // Si hay fecha de fin en el filtro
      if (filters.fechaFin) {
        const endDate = new Date(filters.fechaFin);
        if (fechaFinRegistro > endDate) {
          return false; // El registro finaliza después del período de filtro
        }
      }
    }

    // Filtro por facultades
    if (filters.facultades.length > 0) {
      const facultadesRegistro = registro.facultades.map(f => f.nombre);
      // Verificar si al menos una facultad del registro está en las facultades seleccionadas
      const tieneAlgunaFacultadFiltrada = facultadesRegistro.some(fac => 
        filters.facultades.includes(fac)
      );
      
      if (!tieneAlgunaFacultadFiltrada) {
        return false;
      }
    }

    // Filtro por carreras (solo si hay carreras seleccionadas)
    if (filters.carreras.length > 0) {
      // Obtener todas las carreras del registro
      const todasCarrerasRegistro = registro.facultades.flatMap(f => f.carreras);
      
      // Verificar si alguna carrera del registro está en las carreras seleccionadas
      const tieneAlgunaCarreraFiltrada = todasCarrerasRegistro.some(carrera => 
        filters.carreras.includes(carrera)
      );
      
      if (!tieneAlgunaCarreraFiltrada) {
        return false;
      }
    }

    return true;
  });

  // Si hay filtros de facultad activos, filtramos los datos de cada registro
  // para solo mostrar la información de las facultades filtradas
  if (filters.facultades.length > 0) {
    registrosFiltrados = registrosFiltrados.map(registro => {
      // Crear una copia del registro
      const registroFiltrado = {...registro};
      
      // Filtrar solo las facultades seleccionadas
      registroFiltrado.facultades = registro.facultades.filter(facultad => 
        filters.facultades.includes(facultad.nombre)
      );
      
      return registroFiltrado;
    });
  }

  // Si hay filtros de carrera activos, filtramos los datos de cada registro
  // para solo mostrar las facultades que contienen esas carreras y solo esas carreras específicas
  if (filters.carreras.length > 0) {
    registrosFiltrados = registrosFiltrados.map(registro => {
      // Crear una copia del registro
      const registroFiltrado = {...registro};
      
      // Usamos filter y map en una sola operación para evitar el problema con null
      registroFiltrado.facultades = registro.facultades
        .filter(facultad => {
          // Verificar si esta facultad tiene alguna de las carreras seleccionadas
          return facultad.carreras.some(carrera => filters.carreras.includes(carrera));
        })
        .map(facultad => {
          // Para cada facultad que pasó el filtro, creamos una nueva versión
          // que solo incluye las carreras seleccionadas
          return {
            nombre: facultad.nombre,
            carreras: facultad.carreras.filter(carrera => 
              filters.carreras.includes(carrera)
            )
          };
        });
      
      return registroFiltrado;
    });
  }

  setRegistrosFiltrados(registrosFiltrados);
};

  // Manejar cambios en los filtros
  const handleFilterChange = (filters: Filters) => {
    // Actualizar las carreras filtradas según las facultades seleccionadas
    if (filters.facultades.length > 0) {
      // Obtener todas las carreras de las facultades seleccionadas
      const carrerasDeFacultades = filters.facultades.flatMap(facultad => {
        return datosFiltros.carrerasPorFacultad.get(facultad) || [];
      });
      
      // Eliminar duplicados
      const carrerasUnicas = [...new Set(carrerasDeFacultades)];
      setCarrerasFiltradas(carrerasUnicas);
      
      // Si hay carreras seleccionadas que ya no están en las facultades seleccionadas, las quitamos
      const carrerasValidas = filters.carreras.filter(carrera => carrerasUnicas.includes(carrera));
      
      // Actualizar el filtro con las carreras válidas
      filters = {
        ...filters,
        carreras: carrerasValidas
      };
    } else {
      // Si no hay facultades seleccionadas, mostrar todas las carreras
      setCarrerasFiltradas(datosFiltros.carreras);
    }
    
    setCurrentFilters(filters);
    applyFilters(filters);
  };
  
  // Generar datos para la interfaz considerando solo las facultades filtradas
  const { datosFacultades, datosCarreras, datosTipoProducto, datosProyectos } = 
    generarDatosGraficos(registrosFiltrados, datosFiltros);

  // Datos para las tarjetas numéricas
  const totalRegistros = registrosFiltrados.length;
  const registrosFinalizados = registrosFiltrados.filter(r => r.estado === "Finalizado").length;
  const registrosEnProceso = registrosFiltrados.filter(r => r.estado === "En Proceso").length;
  const registrosInicio = registrosFiltrados.filter(r => r.estado === "Iniciado").length;

  const cardsData = [
    {
      title: "Total Registro de Propiedad Intelectual",
      value: totalRegistros,
      description: totalRegistros > 0 ? `${Math.round((registrosFinalizados / totalRegistros) * 100)}%` : "0%",
      progress: totalRegistros > 0 ? Math.round((registrosFinalizados / totalRegistros) * 100) : 0,
    },
    
  ];

  const smallCardsData = [
    { title: "Finalizados", value: registrosFinalizados },
    { title: "Iniciados-En progreso", value: `${registrosInicio}-${registrosEnProceso}`},
  ];

  // Tarjetas de productos
  const productCards = prepararTarjetasProductos(registrosFiltrados, datosFiltros.productos);

  return (
    <PDFExport
      captureIds={["cardprincipal","taskProgress","granttchart"]}
      filtersData={{
        year: new Date().getFullYear().toString(),
        facultad: currentFilters.facultades.join(", "),
        estado: currentFilters.estado,
        fechaInicio: currentFilters.fechaInicio,
        fechaFin: currentFilters.fechaFin,
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
              carreras={carrerasFiltradas}
              currentFilters={currentFilters}
            />

            {/* Tarjetas numéricas */}
            <div className="flex-grow space-y-2 ml=0 justify-center" >
              <div  className="flex flex-wrap justify-center">
              <NumericCards
                cardsData={cardsData}
                smallCardsData={smallCardsData}
                projectCategories={datosProyectos}
                
              />
              </div>
            </div>

            {/* Separador: Distribución de Registros */}
            <Separator title="Distribución de Registros Universidad Técnica de Ambato" />

            {/* Gráficos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-200 p-3 rounded-lg" >
              <div id="cardprincipal">
                <CardPrincipal
                  title="Panel General"
                  className="w-full text-center text-sm border border-gray-300 bg-gray-800 rounded-lg p-4 shadow-sm"
                  barChartData={datosFacultades}
                  stackedBarChartData={datosTipoProducto}
                />
              </div>
              <div id="taskProgress" >
                <HorizontalBar Datos={datosCarreras} />
              </div>
            </div>

            {/* Separador: Detalle de Productos */}
            <Separator title="Detalle de Productos" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-200 p-3 rounded-lg">
              <div>
                <TableProducts 
                  columns={[
                    { header: "N°", accessorKey: "number" },
                    { header: "Nombre Producto", accessorKey: "name" },
                    { header: "Tipo", accessorKey: "description" },
                    { header: "Proyecto", accessorKey: "category" },
                    { header: "Facultades", accessorKey: "facultades" },
                    { header: "Carreras", accessorKey: "carreras" }
                  ]} 
                  data={prepararDatosTabla(registrosFiltrados)} 
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Cantidad por Tipo de Producto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {productCards.map((card, index) => (
                    <ProductTypeCard key={index} title={card.title} value={card.value} icon={card.icon} />
                  ))}
                </div>
              </div>
            </div>

            {/* Separador: Seguimiento de Registros */}
            <Separator title="Seguimiento de Registros" />

            {/* Gráfico de Gantt */}
            <div className="p-3" id="granttchart">
              <GanttChart tasks={prepararDatosGantt(registrosFiltrados)} />
            </div>
          </main>
        </div>
      </div>
    </PDFExport>
  );
};

export default Dashboard;