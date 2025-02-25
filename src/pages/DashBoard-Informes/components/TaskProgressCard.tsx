import { TaskProgressCardProps } from "./interfaces/cardtareasprops.interface";
const TaskProgressCard: React.FC<TaskProgressCardProps> = ({
  completedTasks,
  totalTasks,
  nameTasks,
}) => {
  // Calcula el porcentaje de tareas completadas
  const progress = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-white">{nameTasks}</h3>
      <p className="text-sm text-white">
        {completedTasks} de {totalTasks} procesos completados /{completedTasks}{" "}
        de {totalTasks} Registros completados
      </p>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Porcentaje de progreso */}
      <p className="text-sm text-white mt-2">{progress}% completado</p>
    </div>
  );
};

export default TaskProgressCard;
