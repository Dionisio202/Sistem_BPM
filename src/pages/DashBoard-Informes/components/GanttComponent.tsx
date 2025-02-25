import React, { useState } from "react";
import { Box, Typography, Collapse, IconButton, Tooltip } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { GanttChartProps, Task } from "./interfaces/ganttprops.interface";

// Componente para la barra de progreso
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <Box
    bgcolor="primary.light"
    borderRadius="4px"
    height="100%"
    width={`${progress}%`}
  />
);
// Función para calcular la duración de la tarea en días
const calculateDuration = (task: Task): number => {
  // Si la tarea está completada, asumimos una duración de 1 día
  if (task.progress === 100) return 1;

  // Si la tarea está en progreso, asumimos una duración estimada (por ejemplo, 5 días)
  return 5;
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
}> = ({ task, level, isExpanded, hasSubtasks, onToggle, duration, position, earliestDate }) => (
  <Box>
    {/* Fila de la tarea */}
    <Box
      display="flex"
      alignItems="center"
      height="50px"
      bgcolor={level % 2 === 0 ? "grey.100" : "grey.200"}
      px={2}
    >
      {/* Ícono para expandir/colapsar */}
      {hasSubtasks && (
        <IconButton size="small" onClick={onToggle}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      )}

      {/* Nombre de la tarea */}
      <Box flex={2} ml={hasSubtasks ? 0 : 4} minWidth="150px">
        <Tooltip title={task.name}>
          <Typography variant="body1" noWrap sx={{ textOverflow: "ellipsis", overflow: "hidden" }}>
            {task.name}
          </Typography>
        </Tooltip>
      </Box>

      {/* Fecha de inicio */}
      <Box flex={1} minWidth="100px">
        <Typography variant="body2" noWrap>
          {task.startDate.toLocaleDateString()}
        </Typography>
      </Box>

      {/* Estado */}
      <Box flex={1} minWidth="100px">
        <Typography variant="body2" noWrap>
          {task.progress === 100 ? "Completada" : "En progreso"}
        </Typography>
      </Box>

      {/* Barra de progreso */}
      <Box flex={3} position="relative" height="20px" mx={2}>
        <Box
          bgcolor="primary.main"
          borderRadius="4px"
          height="100%"
          position="absolute"
          left={`${position * 20}px`} // Posición basada en la fecha de inicio
          width={`${duration * 20}px`} // Ancho basado en la duración
        >
          <ProgressBar progress={task.progress} />
        </Box>
      </Box>
    </Box>

    {/* Subtareas (si están expandidas) */}
    {hasSubtasks && (
      <Collapse in={isExpanded}>
        <Box pl={4}>
          {task.subtasks?.map((subtask) => {
            const subtaskDuration = calculateDuration(subtask);
            const subtaskPosition = calculatePosition(subtask.startDate, earliestDate);

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
        </Box>
      </Collapse>
    )}
  </Box>
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
    <Box bgcolor="background.paper" borderRadius={2} boxShadow={3} p={3}>
      <Typography variant="h5" mb={3} color="text.primary">
        Gantt - Registro Propiedad Intelectual
      </Typography>

      {/* Cabecera de la cuadrícula */}
      <Box
        display="flex"
        alignItems="center"
        height="40px"
        bgcolor="#1F2937"
        px={2}
      >
        <Box flex={2} minWidth="150px" color="white">
          <Typography variant="subtitle1">Casos</Typography>
        </Box>
        <Box flex={1} minWidth="100px">
          <Typography variant="subtitle1">Fecha Inicio</Typography>
        </Box>
        <Box flex={1} minWidth="100px">
          <Typography variant="subtitle1">Estado</Typography>
        </Box>
        <Box flex={3} mx={2}>
          <Typography variant="subtitle1">Progreso</Typography>
        </Box>
      </Box>

      {/* Tareas */}
      <Box>
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
      </Box>
    </Box>
  );
};

export default GanttChart;