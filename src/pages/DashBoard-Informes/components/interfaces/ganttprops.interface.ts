export interface Task {
    id: string;
    name: string;
    startDate: Date;
    progress: number; // Progreso de la tarea (0 a 100)
    status: string; // Estado de la tarea
    subtasks?: Task[]; // Subtareas (opcional)
  }
  
  // Props del componente
export interface GanttChartProps {
    tasks: Task[];
  }