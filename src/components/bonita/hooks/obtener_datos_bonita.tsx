import { useState, useEffect } from "react";
import { useBonitaService } from "../../../services/bonita.service";
import { Tarea } from "../../../interfaces/bonita.interface";

interface CombinedData {
  usuario: { user_id: string; user_name: string } | null;
  bonitaData: {
    processId: string;
    taskId: string;
    caseId: string;
    processName: string;
  } | null;
  tareaActual: Tarea | null;
  loading: boolean;
  error: Error | null;
}

export const useCombinedBonitaData = (): CombinedData => {
  const {
    obtenerUsuarioAutenticado,
    obtenerDatosBonita,
    obtenerTareaActual,
  } = useBonitaService();

  const [usuario, setUsuario] = useState<{ user_id: string; user_name: string } | null>(null);
  const [bonitaData, setBonitaData] = useState<{
    processId: string;
    taskId: string;
    caseId: string;
    processName: string;
  } | null>(null);
  const [tareaActual, setTareaActual] = useState<Tarea | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtiene el usuario autenticado
        const userData = await obtenerUsuarioAutenticado();
        setUsuario(userData);

        if (userData) {
          // En paralelo obtenemos la tarea actual y los datos de Bonita
          const [tareaData, bonitaDataResult] = await Promise.all([
            obtenerTareaActual(userData.user_id),
            obtenerDatosBonita(userData.user_id),
          ]);
          setTareaActual(tareaData);
          setBonitaData(bonitaDataResult);
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [obtenerUsuarioAutenticado, obtenerTareaActual, obtenerDatosBonita]);

  return { usuario, bonitaData, tareaActual, loading, error };
};
