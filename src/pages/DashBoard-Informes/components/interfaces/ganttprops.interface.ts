export interface Task {
    id: string;
    name: string;
    startDate: Date;
    progress: number; 
    status: string; 
    subtasks?: Task[];
  }
  // Props del componente
export interface GanttChartProps {
    tasks: Task[];
  }