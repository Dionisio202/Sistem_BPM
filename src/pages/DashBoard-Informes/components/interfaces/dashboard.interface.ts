// Definición de tipos
 export interface Filters {
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
export interface RegistroPI {
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
export interface ProductCard {
  title: string;
  value: number;
  icon?: React.ReactNode;
}

// Interfaz para las opciones de filtros
export interface DatosFiltros {
  estados: string[];
  proyectos: string[];
  productos: string[];
  funcionarios: string[];
  facultades: string[];
  carreras: string[];
  carrerasPorFacultad: Map<string, string[]>; // Mapa para relacionar facultades con carreras
}