import { useCallback, useRef } from "react";
import { Socket } from "socket.io-client";

interface SaveTempStateData {
  id_registro: string;
  id_tarea: number;
  jsonData: string;
  id_funcionario: number;
  estado: string;
}

interface SaveTempStateResponse {
  success: boolean;
  message: string;
}
interface SaveTempStateOptions {
  intervalRef?: React.MutableRefObject<NodeJS.Timeout | null>;
}

export const useSaveTempState = (
  socket: Socket,
  options?: SaveTempStateOptions
) => {
  const intervalRef = options?.intervalRef || useRef<NodeJS.Timeout | null>(null);

  const saveTempState = useCallback(
    (data: SaveTempStateData): Promise<SaveTempStateResponse> => {
      console.log("Data:", data);
      return new Promise((resolve, reject) => {
        socket.emit(
          "guardar_estado_temporal",
          data,
          (response: SaveTempStateResponse) => {
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error(response.message));
            }
          }
        );
      });
    },
    [socket]
  );

  // Función para iniciar el guardado iterativo (estado "En Proceso")
  const startAutoSave = useCallback(
    (
      data: Omit<SaveTempStateData, "estado">,
      intervalMs: number = 10000,
      estado: string = "En Proceso"
    ) => {
      // Si hay un intervalo previo, se limpia
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Guardado inmediato
      saveTempState({ ...data, estado });
      // Configurar guardado periódico
      intervalRef.current = setInterval(() => {
        saveTempState({ ...data, estado });
      }, intervalMs);
    },
    [saveTempState]
  );

  // Función para detener el guardado iterativo
  const stopAutoSave = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Función para guardar el estado final (estado "Finalizado") y detener el guardado iterativo
  const saveFinalState = useCallback(
    (data: Omit<SaveTempStateData, "estado">) => {
      stopAutoSave();
      return saveTempState({ ...data, estado: "Finalizado" });
    },
    [saveTempState, stopAutoSave]
  );

  return { saveTempState, startAutoSave, stopAutoSave, saveFinalState };
};