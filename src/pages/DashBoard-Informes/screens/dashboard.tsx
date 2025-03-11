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
import { FiPackage } from "react-icons/fi";

const socket = io(SERVER_BACK_URL);
const API_URL = SERVER_BACK_URL + "/api"; // URL base para las consultas API

// Definición de tipos
interface Filters {
  estado: string;
  proyecto: string[];
  producto: string[];
  funcionario: string;
  facultades: string[];
  carreras: string[];
  fechaInicio: string;
  fechaFin: string;
}

// Interfaces para los datos
interface RegistroPI {
  id: string;
  numero: number;
  nombre: string;
  descripcion: string;
  tipoProducto: string;
  tipoProyecto: string;
  facultades: string[];
  carreras: string[];
  funcionario: string;
  estado: string;
  progreso: number;
  fechaInicio: string;
  fechaFin: string;
  subtareas?: {
    id: string;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    estado: string;
    archivos?: {
      id: string;
      name: string;
      path?: string;
    }[];
  }[];
}

// Interfaz para las tarjetas de productos
interface ProductCard {
  title: string;
  value: number;
  icon?: React.ReactNode;
}

// Interfaz para las opciones de filtros
interface DatosFiltros {
  estados: string[];
  proyectos: string[];
  productos: string[];
  funcionarios: string[];
  facultades: string[];
  carreras: string[];
  carrerasPorFacultad: Map<string, string[]>; // Mapa para relacionar facultades con carreras
}

const Dashboard: React.FC = () => {
  // Estado para todos los datos (origen único)
  const [todosRegistros, setTodosRegistros] = useState<RegistroPI[]>([]);
  
  // Estado para los datos filtrados
  const [registrosFiltrados, setRegistrosFiltrados] = useState<RegistroPI[]>([]);

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

  // Estado para las opciones de filtros
  const [datosFiltros, setDatosFiltros] = useState<DatosFiltros>({
    estados: [],
    proyectos: [],
    productos: [],
    funcionarios: [],
    facultades: [],
    carreras: [],
    carrerasPorFacultad: new Map<string, string[]>(),
  });

  // Estado para controlar las carreras filtradas según la facultad seleccionada
  const [carrerasFiltradas, setCarrerasFiltradas] = useState<string[]>([]);

  // Función para cargar los datos principales (registros)
  const cargarRegistros = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/registros`);
      // const datos = response.data;
      
      // Simulación de datos para desarrollo
      const datosSimulados: RegistroPI[] = [
        {
          id: "1",
          numero: 1,
          nombre: "Software BPM",
          descripcion: "Sistema de gestión de procesos de negocio",
          tipoProducto: "Software",
          tipoProyecto: "Investigación",
          facultades: ["FISEI", "FCHE"],
          carreras: ["Software", "TI"],
          funcionario: "Jimmy",
          estado: "Finalizado",
          progreso: 100,
          fechaInicio: "2024-09-01",
          fechaFin: "2024-09-05",
          subtareas: [
            {
              id: "1.1",
              nombre: "Asesoría para Registro de Propiedad Intelectual",
              fechaInicio: "2023-09-01",
              fechaFin: "2023-09-03",
              estado: "Completado",
              archivos: [
                { id: "f1", name: "Informe_Asesoria.pdf", path: "/ruta/al/archivo/Informe_Asesoria.pdf" },
                { id: "f2", name: "Formulario_PI.docx" }
              ]
            },
            {
              id: "1.2",
              nombre: "Atención de Solicitud de Registro de Propiedad Intelectual",
              fechaInicio: "2023-09-03",
              fechaFin: "2023-09-05",
              estado: "Completado"
            }
          ]
        },
        // Resto de los datos simulados (aquí irían los otros registros)
        {
          id: "2",
          numero: 2,
          nombre: "Mini Película",
          descripcion: "Cortometraje educativo",
          tipoProducto: "R.Obras Artisticas",
          tipoProyecto: "Vinculación",
          facultades: ["FCHE", "FDA"],
          carreras: ["Diseño", "Administración"],
          funcionario: "Fanny",
          estado: "En Proceso",
          progreso: 30,
          fechaInicio: "2024-09-03",
          fechaFin: "2024-09-15",
          subtareas: []
        },
        // Más datos simulados...
        {
          id: "3",
          numero: 3,
          nombre: "Libro: Vida en la UTA",
          descripcion: "Publicación institucional",
          tipoProducto: "R. Obras Literarias",
          tipoProyecto: "Carrera",
          facultades: ["FDA"],
          carreras: ["Administración"],
          funcionario: "Jimmy",
          estado: "Finalizado",
          progreso: 100,
          fechaInicio: "2024-08-25",
          fechaFin: "2024-09-10",
          subtareas: []
        },
        {
          id: "4",
          numero: 4,
          nombre: "Manual de Programación",
          descripcion: "Guía técnica",
          tipoProducto: "R. Obras Literarias",
          tipoProyecto: "Investigación",
          facultades: ["FISEI"],
          carreras: ["Software", "TI"],
          funcionario: "Jimmy",
          estado: "En Proceso",
          progreso: 60,
          fechaInicio: "2023-10-01",
          fechaFin: "2023-10-30",
          subtareas: []
        }
      ];
      
      setTodosRegistros(datosSimulados);
      setRegistrosFiltrados(datosSimulados);
      
    } catch (error) {
      console.error("Error al cargar registros:", error);
    }
  };

  // Funciones para cargar datos de cada filtro de forma independiente
  const cargarEstados = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/estados`);
      // return response.data;
      
      // Datos simulados para desarrollo
      return ["En Proceso", "Finalizado"];
    } catch (error) {
      console.error("Error al cargar estados:", error);
      return [];
    }
  };

  const cargarProyectos = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/proyectos`);
      // return response.data;
      
      return ["Investigación", "Vinculación", "Carrera"];
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
      return [];
    }
  };

  const cargarProductos = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/productos`);
      // return response.data;
      
      return ["R. Obras Literarias", "Software", "Libro", "R.Obras Artisticas", "R. P Radio", "R. Fonogramas"];
    } catch (error) {
      console.error("Error al cargar productos:", error);
      return [];
    }
  };

  const cargarFuncionarios = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/funcionarios`);
      // return response.data;
      
      return ["Jimmy", "Fanny"];
    } catch (error) {
      console.error("Error al cargar funcionarios:", error);
      return [];
    }
  };

  const cargarFacultades = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/facultades`);
      // return response.data;
      
      return ["FISEI", "FCHE", "FDA", "FCS"];
    } catch (error) {
      console.error("Error al cargar facultades:", error);
      return [];
    }
  };

  const cargarCarreras = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/carreras`);
      // return response.data;
      
      return [
        "Ingeniería Civil",
        "Ingeniería de Sistemas",
        "Medicina",
        "Derecho",
        "Arquitectura",
        "Software",
        "TI",
        "Administración",
        "Diseño"
      ];
    } catch (error) {
      console.error("Error al cargar carreras:", error);
      return [];
    }
  };

  // Función para cargar la relación entre facultades y carreras
  const cargarCarrerasPorFacultad = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/facultades-carreras`);
      // Construir el mapa a partir de la respuesta
      
      // Datos simulados para desarrollo
      const relaciones = [
        { facultad: "FISEI", carreras: ["Ingeniería Civil", "Ingeniería de Sistemas", "Software", "TI"] },
        { facultad: "FCHE", carreras: ["Derecho", "Administración"] },
        { facultad: "FDA", carreras: ["Arquitectura", "Diseño"] },
        { facultad: "FCS", carreras: ["Medicina"] }
      ];
      
      const mapa = new Map<string, string[]>();
      relaciones.forEach(rel => {
        mapa.set(rel.facultad, rel.carreras);
      });
      
      return mapa;
    } catch (error) {
      console.error("Error al cargar relación facultades-carreras:", error);
      return new Map<string, string[]>();
    }
  };

  // Función para cargar todos los datos de filtros de forma independiente
  const cargarTodosDatosFiltros = async () => {
    const [estados, proyectos, productos, funcionarios, facultades, carreras, carrerasPorFacultad] = await Promise.all([
      cargarEstados(),
      cargarProyectos(),
      cargarProductos(),
      cargarFuncionarios(),
      cargarFacultades(),
      cargarCarreras(),
      cargarCarrerasPorFacultad()
    ]);
    
    setDatosFiltros({
      estados,
      proyectos,
      productos,
      funcionarios,
      facultades,
      carreras,
      carrerasPorFacultad
    });
    
    // Inicialmente, mostrar todas las carreras
    setCarrerasFiltradas(carreras);
  };

  // Carga inicial de datos
  useEffect(() => {
    cargarRegistros();
    cargarTodosDatosFiltros();
  }, []);

  // Función para aplicar filtros a los datos
  const applyFilters = (filters: Filters) => {
    const registrosFiltrados = todosRegistros.filter(registro => {
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

      // Filtro por facultades (verifica intersección entre arrays)
      if (filters.facultades.length > 0 && !registro.facultades.some(facultad => filters.facultades.includes(facultad))) {
        return false;
      }

      // Filtro por carreras (verifica intersección entre arrays)
      if (filters.carreras.length > 0 && !registro.carreras.some(carrera => filters.carreras.includes(carrera))) {
        return false;
      }

      // Filtro por fecha (usando solo la fecha de fin del registro)
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

      return true;
    });

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

  // Función para generar datos derivados para los gráficos
  const generarDatosGraficos = () => {
    // Mapa para contar registros por facultad (con arrays planos)
    const conteoFacultades = new Map<string, number>();
    datosFiltros.facultades.forEach(facultad => {
      conteoFacultades.set(facultad, 0);
    });
    
    // Contar registros para cada facultad
    registrosFiltrados.forEach(registro => {
      registro.facultades.forEach(facultad => {
        const contador = conteoFacultades.get(facultad) || 0;
        conteoFacultades.set(facultad, contador + 1);
      });
    });
    
    // Convertir a formato para gráfico
    const datosFacultades = Array.from(conteoFacultades.entries()).map(([facultad, count]) => ({
      name: facultad,
      value: count,
      facultad: facultad
    }));

    // Mapa para contar registros por carrera (con arrays planos)
    const conteoCarreras = new Map<string, number>();
    datosFiltros.carreras.forEach(carrera => {
      conteoCarreras.set(carrera, 0);
    });
    
    // Contar registros para cada carrera
    registrosFiltrados.forEach(registro => {
      registro.carreras.forEach(carrera => {
        const contador = conteoCarreras.get(carrera) || 0;
        conteoCarreras.set(carrera, contador + 1);
      });
    });
    
    // Convertir a formato para gráfico
    const datosCarreras = Array.from(conteoCarreras.entries()).map(([carrera, count]) => ({
      key: carrera,
      value: count,
      carrera: carrera
    }));

    // Datos para gráfico de barras apiladas (por tipo de producto)
    const datosTipoProducto = Array.from(
      datosFiltros.productos.reduce((acc, producto) => {
        const registrosProducto = registrosFiltrados.filter(reg => reg.tipoProducto === producto);
        const investigacion = registrosProducto.filter(reg => reg.tipoProyecto === "Investigación").length;
        const vinculacion = registrosProducto.filter(reg => reg.tipoProyecto === "Vinculación").length;
        const carrera = registrosProducto.filter(reg => reg.tipoProyecto === "Carrera").length;
        
        acc.set(producto, { 
          name: producto, 
          value1: investigacion, // Investigación
          value2: vinculacion, // Vinculación
          value3: carrera, // Carrera
          tipo: producto 
        });
        
        return acc;
      }, new Map())
    ).map(([_, value]) => value);

    // Datos para categorías de proyectos
    const datosProyectos = Array.from(
      datosFiltros.proyectos.reduce((acc, proyecto) => {
        const count = registrosFiltrados.filter(reg => reg.tipoProyecto === proyecto).length;
        acc.set(proyecto, { 
          name: proyecto, 
          count: count, 
          proyecto: proyecto 
        });
        return acc;
      }, new Map())
    ).map(([_, value]) => value);

    return {
      datosFacultades,
      datosCarreras,
      datosTipoProducto,
      datosProyectos
    };
  };

  // Preparar datos para Gantt
  const prepararDatosGantt = () => {
    return registrosFiltrados.map(registro => ({
      id: registro.id,
      name: `Caso ${registro.numero} - ${registro.nombre}`,
      startDate: new Date(registro.fechaInicio),
      endDate: new Date(registro.fechaFin),
      progress: registro.progreso,
      status: registro.estado,
      facultades: registro.facultades.join(", "), // Unir las facultades con coma para mostrar
      proyecto: registro.tipoProyecto,
      producto: registro.tipoProducto,
      funcionario: registro.funcionario,
      carreras: registro.carreras.join(", "), // Unir las carreras con coma para mostrar
      subtasks: registro.subtareas ? registro.subtareas.map(subtarea => ({
        id: subtarea.id,
        name: subtarea.nombre,
        startDate: new Date(subtarea.fechaInicio),
        endDate: new Date(subtarea.fechaFin),
        status: subtarea.estado,
        files: subtarea.archivos
      })) : []
    }));
  };

  // Preparar datos para tabla de productos
  const prepararDatosTabla = () => {
    return registrosFiltrados.map(registro => ({
      number: registro.numero,
      name: registro.nombre,
      description: registro.tipoProducto,
      category: registro.tipoProyecto,
      facultades: registro.facultades.join(", "), // Mostrar facultades separadas por coma
      carreras: registro.carreras.join(", ") // Mostrar carreras separadas por coma
    }));
  };
  
  // Preparar datos para las tarjetas de productos
  const prepararTarjetasProductos = () => {
    return datosFiltros.productos.map(producto => ({
      title: producto,
      value: registrosFiltrados.filter(reg => reg.tipoProducto === producto).length,
      icon: <FiPackage className="h-8 w-8 text-blue-500" />
    }));
  };

  // Obtener todos los datos derivados para los gráficos
  const { datosFacultades, datosCarreras, datosTipoProducto, datosProyectos } = generarDatosGraficos();
  
  // Datos para las tarjetas numéricas
  const totalRegistros = registrosFiltrados.length;
  const registrosFinalizados = registrosFiltrados.filter(r => r.estado === "Finalizado").length;
  const registrosEnProceso = registrosFiltrados.filter(r => r.estado === "En Proceso").length;
  
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
    { title: "En progreso", value: registrosEnProceso },
  ];

  // Tarjetas de productos
  const productCards = prepararTarjetasProductos();

  // Componente de tarjeta de producto
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

  return (
    <PDFExport
      captureIds={["taskProgress"]}
      filtersData={{
        year: new Date().getFullYear().toString(),
        facultad: currentFilters.facultades.join(", "), // Mostrar facultades seleccionadas
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
              carreras={carrerasFiltradas} // Usamos el estado de carreras filtradas
              currentFilters={currentFilters} // Pasamos los filtros actuales
            />

            {/* Tarjetas numéricas */}
            <div className="flex-grow md:ml-15 space-y-2 ml=0">
              <NumericCards
                cardsData={cardsData}
                smallCardsData={smallCardsData}
                projectCategories={datosProyectos}
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
                  barChartData={datosFacultades}
                  stackedBarChartData={datosTipoProducto}
                />
              </div>
              <div id="taskProgress">
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
                  data={prepararDatosTabla()} 
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
            <div className="p-3">
              <GanttChart tasks={prepararDatosGantt()} />
            </div>
          </main>
        </div>
      </div>
    </PDFExport>
  );
};

export default Dashboard;