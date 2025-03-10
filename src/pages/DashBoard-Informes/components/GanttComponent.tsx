import React, { useState } from "react";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { GanttChartProps, Task, TaskFile } from "./interfaces/ganttprops.interface";

// Progress bar for main tasks (without date offset)
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div
    className="bg-blue-300 rounded h-full"
    style={{ width: `${progress}%` }}
  />
);

// Component for file icon (documents only)
const FileIcon: React.FC<{ file: TaskFile }> = ({ file }) => {
  const handleFileClick = () => {
    // Verifica si el archivo tiene un path/código de almacenamiento
    if (file.path) {
      // Abre una nueva ventana/pestaña con DocumentViewer
      const viewerUrl = `/document-viewer?key=${encodeURIComponent(file.path)}&title=${encodeURIComponent(file.path)}`;
      window.open(viewerUrl, '_blank');
    } else {
      // Si no hay path, muestra un alert con el ID del documento
      alert(`Documento sin archivo asociado. ID: ${file.id}`);
    }
  };

  return (
    <div 
      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded border border-gray-300 cursor-pointer mr-2 hover:bg-gray-200 transition-colors"
      onClick={handleFileClick}
      title={file.name}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    </div>
  );
};

// File section component for displaying task files
const FileSection: React.FC<{ files?: TaskFile[] }> = ({ files = [] }) => {
  return (
    <div className="flex items-center">
      {files.map(file => (
        <FileIcon key={file.id} file={file} />
      ))}
    </div>
  );
};

// Helper function to format dates
const formatDate = (dateString:any) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

const TaskRow: React.FC<{
  task: Task;
  level: number;
  isExpanded: boolean;
  hasSubtasks: boolean;
  onToggle: () => void;
  isSubtask?: boolean;
}> = ({
  task,
  level,
  isExpanded,
  hasSubtasks,
  onToggle,
  isSubtask = false,
}) => {
  return (
    <div>
      <div
        className={`flex items-center h-auto min-h-12 px-4 transition-all duration-200 
        ${level % 2 === 0 ? "bg-gray-100" : "bg-gray-200"} 
        hover:bg-blue-50 hover:shadow-md hover:border-l-4 hover:border-blue-500 cursor-pointer`}
      >
        {/* Expand/collapse button */}
        <div className="w-8 flex-shrink-0">
          {hasSubtasks && (
            <button
              className="p-1 rounded hover:bg-gray-300 transition-colors"
              onClick={onToggle}
            >
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </button>
          )}
        </div>

        {/* Task name without truncation */}
        <div className="flex-2 ml-0 min-w-[250px] py-2 pr-1">
          <p className="text-sm break-words transition-all duration-200 hover:font-medium">{task.name}</p>
        </div>

        {/* Start date */}
        <div className="flex-1 min-w-[130px] flex-shrink-0">
          <p className="text-sm">
            {formatDate(task.startDate)}
          </p>
        </div>

        {/* End date */}
        <div className="flex-1 min-w-[130px] flex-shrink-0">
          <p className="text-sm">
            {formatDate(task.endDate)}
          </p>
        </div>

        {/* Status */}
        <div className="flex-1 min-w-[130px] flex-shrink-0">
          <p className={`text-sm rounded-full px-2 py-1 inline-block transition-all duration-200
            ${isSubtask 
              ? (task.status === "Completado" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800")
              : (task.progress === 100 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800")}`}>
            {isSubtask ? task.status : (task.progress === 100 ? "Completada" : "En progreso")}
          </p>
        </div>

        {/* Conditional: Show progress bar or files */}
        <div className="flex-2 mx-2 relative h-5 min-w-[100px] flex-shrink-0">
          {isSubtask ? (
            <FileSection files={task.files} />
          ) : (
            <div className="bg-blue-500 rounded h-full w-full">
              <ProgressBar progress={task.progress || 0} />
            </div>
          )}
        </div>
      </div>

      {hasSubtasks && isExpanded && (
        <div className="pl-2 transition-all duration-300">
          {task.subtasks?.map((subtask) => (
            <TaskRow
              key={subtask.id}
              task={subtask}
              level={level + 1}
              isExpanded={false}
              hasSubtasks={!!subtask.subtasks?.length}
              onToggle={() => {}}
              isSubtask={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      newSet.has(taskId) ? newSet.delete(taskId) : newSet.add(taskId);
      return newSet;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Gantt - Registro Propiedad Intelectual
      </h2>

      {/* Header */}
      <div className="flex items-center h-16 bg-gray-800 px-4 rounded-t-lg">
        <div className="w-8 flex-shrink-0"></div>
        <div className="flex-2 min-w-[250px]">
          <p className="text-white font-semibold">Casos</p>
        </div>
        <div className="flex-1 min-w-[130px] flex-shrink-0">
          <p className="text-white font-semibold">Fecha Inicio</p>
        </div>
        <div className="flex-1 min-w-[130px] flex-shrink-0">
          <p className="text-white font-semibold">Fecha Fin</p>
        </div>
        <div className="flex-1 min-w-[130px] flex-shrink-0">
          <p className="text-white font-semibold">Estado de Caso</p>
        </div>
        <div className="flex-2 mx-2 min-w-[200px] flex-shrink-0">
          <p className="text-white font-semibold">Progreso / Archivos</p>
        </div>
      </div>

      {/* Tasks */}
      <div>
        {tasks.map((task) => {
          const hasSubtasks = !!task.subtasks?.length;
          const isExpanded = expandedTasks.has(task.id);

          return (
            <TaskRow
              key={task.id}
              task={task}
              level={0}
              isExpanded={isExpanded}
              hasSubtasks={hasSubtasks}
              onToggle={() => toggleTask(task.id)}
              isSubtask={false}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GanttChart;