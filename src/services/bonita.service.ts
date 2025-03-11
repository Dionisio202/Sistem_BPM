import { useCallback, useState } from "react";
import { Tarea } from "../interfaces/bonita.interface";
import { SERVER_BONITA_URL } from "../config";
// @ts-ignore
import BonitaUtilities from "../components/bonita/bonita-utilities";
// Nota: Asegúrate de que la interfaz Tarea incluya al menos estos campos:
// id, caseId, processId, displayName, name, last_update_date

export const useBonitaService = () => {
  const [error, setError] = useState<string | null>(null);
  const bonitaUtilities = new BonitaUtilities();

  // 🔹 Función para obtener el usuario autenticado usando API 1
  const obtenerUsuarioAutenticado = useCallback(async (): Promise<{
    user_id: string;
    user_name: string;
  } | null> => {
    try {
      const response = await fetch(
        `${SERVER_BONITA_URL}/bonita/API/system/session/unusedId`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Bonita-API-Token": "tu_token_aqui",
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return { user_id: data.user_id, user_name: data.user_name };
    } catch (error) {
      console.error("❌ Error al obtener el usuario autenticado:", error);
      setError(
        error instanceof Error ? error.message : "Error desconocido"
      );
      return null;
    }
  }, []);

  // 🔹 Obtener la tarea actual del usuario usando API 2
  const obtenerTareaActual = useCallback(
    async (userId: string): Promise<Tarea | null> => {
      try {
        if (process.env.NODE_ENV === "development") {
        }
        const taskInstance = await bonitaUtilities.getTaskInstance();
  
        const response = await fetch(
          `${SERVER_BONITA_URL}/bonita/API/bpm/humanTask?p=0&c=10000&f=user_id=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-Bonita-API-Token": "tu_token_aqui",
            },
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const tareas: Tarea[] = await response.json();
        if (tareas.length === 0) return null;
  
        // Si taskInstance tiene id, se intenta encontrar la tarea con ese id.
        if (taskInstance)  {
          const tareaEncontrada = tareas.find(t => t.id === taskInstance);
          if (tareaEncontrada) {
            return tareaEncontrada;
          } else {
            console.warn(
              `No se encontró la tarea con id ${taskInstance}. Se procederá a buscar la tarea con la fecha de actualización más reciente.`
            );
          }
        }
  
        // Si no hay id o no se encontró la tarea, se ordenan las tareas por fecha de actualización.
        if (tareas.length > 1) {
          console.warn(
            "El usuario tiene más de una tarea activa. Se seleccionará la más reciente."
          );
          const tareasOrdenadas = tareas.sort((a, b) => {
            return (
              new Date(b.last_update_date).getTime() -
              new Date(a.last_update_date).getTime()
            );
          });
          return tareasOrdenadas[0];
        }
        return tareas[0];
      } catch (error) {
        console.error("Error al obtener la tarea actual:", error);
        setError(
          error instanceof Error ? error.message : "Error desconocido"
        );
        return null;
      }
    },
    []
  );
  

  // 🔹 Función principal que obtiene todos los datos en un solo flujo
  // Usamos sólo las 2 APIs disponibles: la del usuario y la de tareas
  const obtenerDatosBonita = useCallback(
    async (userId: string) => {
      try {
        // 1️⃣ Obtener la tarea asignada al usuario (única tarea activa)
        const tarea = await obtenerTareaActual(userId);
        if (!tarea) {
          console.warn("No hay tarea asignada al usuario.");
          return null;
        }

        // 2️⃣ Dado que no podemos obtener detalles adicionales del proceso,
        // usaremos los datos disponibles en la tarea.
        // Se retornan los siguientes campos:
        // - taskId: ID de la tarea.
        // - caseId: Identificador del caso (instancia).
        // - processId: ID del proceso.
        // - processName: Se toma de 'displayName' o 'name' de la tarea.
        return {
          taskId: tarea.id,
          caseId: tarea.caseId,
          processId: tarea.processId,
          processName: tarea.displayName || tarea.name,
        };
      } catch (error) {
        console.error("Error en obtenerDatosBonita:", error);
        setError(
          error instanceof Error ? error.message : "Error desconocido"
        );
        return null;
      }
    },
    [obtenerTareaActual]
  );

  return {
    obtenerDatosBonita,
    obtenerUsuarioAutenticado,
    obtenerTareaActual,
    error,
  };
};
