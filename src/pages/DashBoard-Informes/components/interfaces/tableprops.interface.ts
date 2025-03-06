// Interfaz para la respuesta del servidor
export interface SocketResponse {
  success: boolean;
  message: string;
  jsonData: string; // jsonData es una cadena JSON
}

// Interfaz para un funcionario
export interface Funcionario {
  Nombre: string;
  Caso: Caso[];
}

// Interfaz para un caso
export interface Caso {
  NombreProceso:string;
  NumeroCaso: string;
  NombreTarea?: Tarea[]; // Campo correcto según el JSON
  FechaRegistro: string;
  FechaFinalizacion?: string;
  ProgresoGeneral: number;
  EstadoProcesoGeneral: string;
}

// Interfaz para una tarea
export interface Tarea {
  Autores: string;
  Nombre:string;
  Progreso: string;
  EstadoDeProceso: string;
  TipoProductos: string;
  NombreProductos: string;
  NombreProyecto: string;
  Facultad: string;
  MemorandoInicial?: string;
}

// Interfaz para los datos de la tabla
export interface TablaTarea extends Tarea {
  NumeroCaso: string; // Agregado para la tabla
  FechaRegistro: string; // Agregado para la tabla
  FechaFinalizacion?: string; // Agregado para la tabla
  ProgresoGeneral: number; // Agregado para la tabla
  EstadoProcesoGeneral: string; // Agregado para la tabla
  NombreProceso: string; // Agregado para la tabla
  Funcionario: string; // Agregado para la tabla
  Autores: string; // Agregado para la tabla
}
