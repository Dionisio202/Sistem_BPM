// Interfaz para la respuesta del servidor
export interface SocketResponse {
  success: boolean;
  message: string;
  jsonData: string; // jsonData es una cadena JSON
}

// Interfaz para el objeto principal de datos
export interface ProcesoData {
  Procesos: Proceso[];
}

// Interfaz para un proceso
export interface Proceso {
  NombreProceso: string;
  Funcionarios: Funcionario[];
}

// Interfaz para un funcionario
export interface Funcionario {
  Nombre: string;
  Caso: Caso[];
}

// Interfaz para un caso
export interface Caso {
  NumeroCaso: string;
  Tareas: Tarea[]; // Campo actualizado según la nueva estructura JSON
  FechaRegistro: string;
  FechaFinalizacion?: string;
  ProgresoGeneral: number;
  EstadoProcesoGeneral: string;
}

// Interfaz para el documento principal
export interface DocumentoPrincipal {
  MemorandoInicial: string;
  // TipoDocumento ha sido eliminado
}

// Interfaz para una tarea
export interface Tarea {
  Nombre: string;
  EstadoDeProceso: string;
  TipoProductos: string;
  NombreProductos: string;
  NombreProyecto: string;
  TipoProyecto?: string;
  Carrera?: string;
  Facultad?: string;
  DocumentoPrincipal?: DocumentoPrincipal; // Cambio de MemorandoInicial a DocumentoPrincipal
  DocumentosSubidos?: any[]; // Si necesitas acceder a estos datos
  Autores?: string;
}

// Interfaz para los datos de la tabla
export interface TablaTarea {
  NombreProceso: string;
  NombreTarea: string;
  EstadoDeProceso: string;
  TipoProductos: string;
  NombreProductos: string;
  NombreProyecto: string;
  Facultad: string;
  Carrera: string;
  TipoProyecto: string;
  MemorandoInicial: string;
  NumeroCaso: string;
  FechaRegistro: string;
  FechaFinalizacion: string;
  ProgresoGeneral: number;
  EstadoProcesoGeneral: string;
  Funcionario: string;
  Autores: string;
}