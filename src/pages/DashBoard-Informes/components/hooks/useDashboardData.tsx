import { useEffect, useState } from "react";
import { DatosFiltros, RegistroPI } from "../interfaces/dashboard.interface";
import { cargarCarreras, cargarCarrerasPorFacultad, cargarEstados, cargarFacultades, cargarFuncionarios, cargarProductos, cargarProyectos } from "../dataFIlters";
import { simulatedData } from "./mockData";
import io from "socket.io-client";
import { SERVER_BACK_URL } from "../../../../config";

const socket = io(SERVER_BACK_URL);

export const useDashboardData = () => {
  // Estado para todos los datos (origen único)
  const [todosRegistros, setTodosRegistros] = useState<RegistroPI[]>([]);
  
  // Estado para los datos filtrados
  const [registrosFiltrados, setRegistrosFiltrados] = useState<RegistroPI[]>([]);

  // Estado de carga
  const [cargando, setCargando] = useState<boolean>(true);

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
      setCargando(true);
      
      // Usar socket para obtener los datos
      socket.emit("obtener_registro", {}, (response: { success: boolean, data: RegistroPI[], message?: string }) => {
        if (response.success && response.data) {
          // Establecer los datos recibidos
          setTodosRegistros(response.data);
          setRegistrosFiltrados(response.data);
          console.log("Registros cargados:", response.data);
        } else {
          console.error("Error al obtener registros:", response.message);
          // Usar datos simulados como fallback en caso de error
          setTodosRegistros(simulatedData);
          setRegistrosFiltrados(simulatedData);
        }
        setCargando(false);
      });
      
    } catch (error) {
      console.error("Error al cargar registros:", error);
      // Usar datos simulados como fallback
      setTodosRegistros(simulatedData);
      setRegistrosFiltrados(simulatedData);
      setCargando(false);
    }
  };

  // Extraer datos de filtros desde los registros recibidos
  const extraerDatosFiltrosDeRegistros = (registros: RegistroPI[]) => {
    const estados = [...new Set(registros.map(r => r.estado))];
    const proyectos = [...new Set(registros.map(r => r.tipoProyecto))];
    const productos = [...new Set(registros.map(r => r.tipoProducto))];
    const funcionarios = [...new Set(registros.map(r => r.funcionario))];
    
    // Extraer facultades y carreras de forma estructurada
    const facultadesSet = new Set<string>();
    const carrerasSet = new Set<string>();
    const carrerasPorFacultadMap = new Map<string, string[]>();
    
    registros.forEach(registro => {
      registro.facultades.forEach(facultad => {
        facultadesSet.add(facultad.nombre);
        
        // Agregar carreras al set general
        facultad.carreras.forEach(carrera => {
          carrerasSet.add(carrera);
        });
        
        // Mapear carreras por facultad
        if (!carrerasPorFacultadMap.has(facultad.nombre)) {
          carrerasPorFacultadMap.set(facultad.nombre, []);
        }
        
        const carrerasActuales = carrerasPorFacultadMap.get(facultad.nombre) || [];
        facultad.carreras.forEach(carrera => {
          if (!carrerasActuales.includes(carrera)) {
            carrerasActuales.push(carrera);
          }
        });
        
        carrerasPorFacultadMap.set(facultad.nombre, carrerasActuales);
      });
    });
    
    return {
      estados,
      proyectos,
      productos,
      funcionarios,
      facultades: Array.from(facultadesSet),
      carreras: Array.from(carrerasSet),
      carrerasPorFacultad: carrerasPorFacultadMap
    };
  };

  // Función para cargar todos los datos de filtros de forma independiente
  const cargarTodosDatosFiltros = async () => {
    try {
      // Prioridad: Usar los filtros desde los registros recibidos si están disponibles
      if (todosRegistros.length > 0) {
        const filtrosExtraidos = extraerDatosFiltrosDeRegistros(todosRegistros);
        setDatosFiltros(filtrosExtraidos);
        setCarrerasFiltradas(filtrosExtraidos.carreras);
        return;
      }
      
      // Fallback: Cargar filtros desde las funciones de dataFilters.ts
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
    } catch (error) {
      console.error("Error al cargar datos de filtros:", error);
    }
  };

  // Actualiza los filtros cuando cambien los registros
  useEffect(() => {
    if (todosRegistros.length > 0) {
      cargarTodosDatosFiltros();
    }
  }, [todosRegistros]);

  // Carga inicial de datos
  useEffect(() => {
    cargarRegistros();

    // Escuchar actualizaciones en tiempo real
    socket.on('data-update', () => {
      cargarRegistros();
    });

    return () => {
      socket.off('data-update');
    };
  }, []);

  return {
    todosRegistros,
    registrosFiltrados,
    setRegistrosFiltrados,
    datosFiltros,
    carrerasFiltradas,
    setCarrerasFiltradas,
    cargando
  };
};