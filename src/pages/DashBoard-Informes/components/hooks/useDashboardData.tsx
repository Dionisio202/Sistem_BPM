import { useEffect, useState } from "react";
import { DatosFiltros, RegistroPI } from "../interfaces/dashboard.interface";
import { cargarCarreras, cargarCarrerasPorFacultad, cargarEstados, cargarFacultades, cargarFuncionarios, cargarProductos, cargarProyectos } from "../dataFIlters";
import { simulatedData } from "./mockData";
import io from "socket.io-client";
import { SERVER_BACK_URL } from "../../../../config";

const socket = io(SERVER_BACK_URL);
const API_URL = SERVER_BACK_URL + "/api";

export const useDashboardData = () => {
  // Estado para todos los datos (origen único)
  const [todosRegistros, setTodosRegistros] = useState<RegistroPI[]>([]);
  
  // Estado para los datos filtrados
  const [registrosFiltrados, setRegistrosFiltrados] = useState<RegistroPI[]>([]);

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
      setTodosRegistros(simulatedData);
      setRegistrosFiltrados(simulatedData);
      
    } catch (error) {
      console.error("Error al cargar registros:", error);
    }
  };

  // Función para cargar todos los datos de filtros de forma independiente
  const cargarTodosDatosFiltros = async () => {
    try {
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

  // Carga inicial de datos
  useEffect(() => {
    cargarRegistros();
    cargarTodosDatosFiltros();

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
    setCarrerasFiltradas
  };
};