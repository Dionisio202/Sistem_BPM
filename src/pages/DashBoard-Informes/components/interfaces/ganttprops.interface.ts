// Primero actualiza la interfaz Task para incluir archivos
export interface Task {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  progress?: number; // Opcional para subtareas
  status: string;
  subtasks?: Task[];
  files?: TaskFile[]; // Añadido para contener archivos asociados
}

// Interfaz para los archivos
export interface TaskFile {
  id: string;
  name?: string;
  path?: string;
}

// Interfaz para el componente
export interface GanttChartProps {
  tasks: Task[];
}