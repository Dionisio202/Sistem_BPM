import React, { useState } from "react";
import { ExpandMore, ExpandLess } from "@mui/icons-material"; // Puedes reemplazar estos íconos con íconos de Tailwind o otra librería
import { GanttChartProps, Task } from "./interfaces/ganttprops.interface";

// Componente para la barra de progreso
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div
    className="bg-blue-300 rounded h-full"
    style={{ width: `${progress}%` }}
  />
);

// Función para calcular la duración de la tarea en días
const calculateDuration = (task: Task): number => {
  if (task.progress === 100) return 1; // Si la tarea está completada, asumimos una duración de 1 día
  return 5; // Si la tarea está en progreso, asumimos una duración estimada (por ejemplo, 5 días)
};

// Función para calcular la posición horizontal de la tarea
const calculatePosition = (start: Date, earliestDate: Date): number => {
  const timeDiff = start.getTime() - earliestDate.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convertir a días
};

// Componente para una fila de tarea
const TaskRow: React.FC<{
  task: Task;
  level: number;
  isExpanded: boolean;
  hasSubtasks: boolean;
  onToggle: () => void;
  duration: number; // Duración de la tarea en días
  position: number; // Posición de la tarea en el gráfico
  earliestDate: Date; // Nueva prop: fecha más temprana
}> = ({
  task,
  level,
  isExpanded,
  hasSubtasks,
  onToggle,
  duration,
  position,
  earliestDate,
}) => (
  <div>
    {/* Fila de la tarea */}
    <div
      className={`flex items-center h-12 px-2 ${
        level % 2 === 0 ? "bg-gray-100" : "bg-gray-200"
      }`}
    >
      {/* Ícono para expandir/colapsar */}
      {hasSubtasks && (
        <button
          className="p-1 rounded hover:bg-gray-300 transition-colors"
          onClick={onToggle}
        >
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </button>
      )}

      {/* Nombre de la tarea */}
      <div className={`flex-2 ml-${hasSubtasks ? 0 : 4} min-w-[150px]`}>
        <div className="group relative">
          <p className="text-sm truncate">{task.name}</p>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bg-black text-white text-xs p-1 rounded mt-1">
            {task.name}
          </div>
        </div>
      </div>

      {/* Fecha de inicio */}
      <div className="flex-1 min-w-[100px]">
        <p className="text-sm truncate">
          {task.startDate.toLocaleDateString()}
        </p>
      </div>

      {/* Estado */}
      <div className="flex-1 min-w-[100px]">
        <p className="text-sm truncate">
          {task.progress === 100 ? "Completada" : "En progreso"}
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="flex-3 relative h-5 mx-2">
        <div
          className="bg-blue-500 rounded h-full absolute"
          style={{
            left: `${position * 20}px`, // Posición basada en la fecha de inicio
            width: `${duration * 20}px`, // Ancho basado en la duración
          }}
        >
          <ProgressBar progress={task.progress} />
        </div>
      </div>
    </div>

    {/* Subtareas (si están expandidas) */}
    {hasSubtasks && isExpanded && (
      <div className="pl-8">
        {task.subtasks?.map((subtask) => {
          const subtaskDuration = calculateDuration(subtask);
          const subtaskPosition = calculatePosition(
            subtask.startDate,
            earliestDate
          );

          return (
            <TaskRow
              key={subtask.id}
              task={subtask}
              level={level + 1}
              isExpanded={false} // Las subtareas no se expanden por defecto
              hasSubtasks={!!subtask.subtasks?.length}
              onToggle={() => {}}
              duration={subtaskDuration}
              position={subtaskPosition}
              earliestDate={earliestDate} // Pasar earliestDate a las subtareas
            />
          );
        })}
      </div>
    )}
  </div>
);

const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Función para alternar la expansión de una tarea
  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Encuentra la fecha más temprana y la más tardía para escalar el gráfico
  const earliestDate = new Date(
    Math.min(...tasks.map((task) => task.startDate.getTime()))
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Gantt - Registro Propiedad Intelectual
      </h2>

      {/* Cabecera de la cuadrícula */}
      <div className="flex items-center h-18 bg-gray-800 px-2 rounded-t-lg">
        <div className="flex-2 min-w-[290px]">
          <p className="text-white font-semibold">Casos</p>
        </div>
        <div className="flex-1 min-w-[130px]">
          <p className="text-white font-semibold">Fecha Inicio</p>
        </div>
        <div className="flex-1 min-w-[170px]">
          <p className="text-white font-semibold">Fecha Finalización</p>
        </div>
        <div className="flex-1 min-w-[180px]">
          <p className="text-white font-semibold">Estado de Caso</p>
        </div>
        <div className="flex-3 mx-2">
          <p className="text-white font-semibold">Progreso</p>
        </div>
      </div>

      {/* Tareas */}
      <div>
        {tasks.map((task) => {
          const hasSubtasks = !!task.subtasks?.length;
          const isExpanded = expandedTasks.has(task.id);
          const duration = calculateDuration(task);
          const position = calculatePosition(task.startDate, earliestDate);

          return (
            <TaskRow
              key={task.id}
              task={task}
              level={0}
              isExpanded={isExpanded}
              hasSubtasks={hasSubtasks}
              onToggle={() => toggleTask(task.id)}
              duration={duration}
              position={position}
              earliestDate={earliestDate} // Pasar earliestDate a TaskRow
            />
          );
        })}
      </div>
    </div>
  );
};

export default GanttChart;
