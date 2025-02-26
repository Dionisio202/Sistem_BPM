import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import CardContainer from "./components/CardContainer";
import UploadFile from "./components/UploadFile"; // Componente para cargar archivos
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import Title from "./components/TitleProps";
import { SERVER_BACK_URL } from "../../config.ts";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { useBonitaService } from "../../services/bonita.service";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { Tarea } from "../../interfaces/bonita.interface.ts";
// Crear la instancia de Socket.io
const socket = io(SERVER_BACK_URL);

export default function MemoCodeForm() {
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const [memoCode, setMemoCode] = useState("");
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const [error, setError] = useState("");
  const bonita: BonitaUtilities = new BonitaUtilities();
  const id_tipo_documento = 3; // Valor de ejemplo, reemplazar según corresponda
  const [json, setJson] = useState<temporalData | null>(null);
  const [tareaActual, setTareaActual] = useState<Tarea | null>(null);

  // @ts-ignore
  const {
    obtenerUsuarioAutenticado,
    obtenerDatosBonita,
    // @ts-ignore
    error: errorService,
    obtenerTareaActual,
  } = useBonitaService();
  const [usuario, setUsuario] = useState<{
    user_id: string;
    user_name: string;
  } | null>(null);
  const [bonitaData, setBonitaData] = useState<{
    processId: string;
    taskId: string;
    caseId: string;
    processName: string;
  } | null>(null);

  // Obtener usuario autenticado
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await obtenerUsuarioAutenticado();
        if (userData) setUsuario(userData);
        if (usuario) {
          const tareaData = await obtenerTareaActual(usuario.user_id);
          setTareaActual(tareaData);
        }
      } catch (error) {
        console.error("❌ Error obteniendo usuario autenticado:", error);
      }
    };
    fetchUser();
  }, [obtenerUsuarioAutenticado]);

  // Obtener datos de Bonita una vez que se tenga el usuario
  useEffect(() => {
    if (!usuario) return;
    const fetchData = async () => {
      try {
        const data = await obtenerDatosBonita(usuario.user_id);
        if (data) {
          setBonitaData(data);
        }
      } catch (err) {
        console.error("❌ Error obteniendo datos de Bonita:", err);
      }
    };
    fetchData();
  }, [usuario, obtenerDatosBonita]);

  //Autorguardado
  useEffect(() => {
    console.log("Precondicion del guardado", bonitaData);
    if (bonitaData && usuario) {
      console.log("Inicia el guardado", bonitaData);
      const data: temporalData = {
        id_registro: `${bonitaData.processId}-${bonitaData.caseId}`,
        id_tarea: parseInt(bonitaData.taskId),
        jsonData: JSON.stringify("No Form Data"),
        id_funcionario: parseInt(usuario.user_id),
        nombre_tarea: tareaActual?.name || "",
      };
      setJson(data);
      startAutoSave(data, 10000, "En Proceso");
    }
  }, [bonitaData, usuario, startAutoSave]);

  // Función para manejar la carga del archivo del memorando y obtener el código mediante Socket.io
  const handleMemoFileChange = useCallback(
    async (file: File | null) => {
      if (!file) return;
      try {
        setLoading(true);
        setError("");
        // Convertir el archivo a base64
        const memoBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result as string;
            const base64String = result.split(",")[1];
            resolve(base64String);
          };
          reader.onerror = (error) => reject(error);
        });

        // Emitir el evento "subir_documento" a través del socket
        socket.emit(
          "subir_documento",
          {
            documento: memoBase64,
            id_tipo_documento,
            id_registro: `${bonitaData?.processId}-${bonitaData?.caseId}`,
          },
          (response: any) => {
            if (response.success) {
              setMemoCode(response.codigo);
            } else {
              setError("No se pudo obtener el código del memorando.");
            }
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error al obtener el código del memorando:", err);
        setError(
          "Error al obtener el código del memorando. Intente nuevamente."
        );
        setLoading(false);
      }
    },
    [id_tipo_documento, bonitaData]
  );

  // Función para continuar con el proceso usando el código obtenido
  const handleSubmit = async () => {
    try {
      setError("");
      alert("Avanzando a la siguiente página...");
      // Invocar el cambio de tarea
      if (json) {
        await saveFinalState(json);
      } else {
        console.error("❌ Error: json is null");
      }
      await bonita.changeTask();

      // Enviar el código del memorando al endpoint de guardado
      const response = await fetch(
        `${SERVER_BACK_URL}/api/save-memorando?key=${memoCode}&id_tipo_documento=${id_tipo_documento}&id_registro=${bonitaData?.processId}-${bonitaData?.caseId}`
      );

      if (!response.ok) {
        throw new Error("Error al guardar el memorando");
      }

      const data = await response.json();
      console.log("Memorando guardado:", data);
    } catch (err) {
      setError(
        "Error al guardar el memorando. Verifica el código e intenta nuevamente."
      );
      console.error("Error:", err);
    }
  };

  return (
    <CardContainer title="Contrato Cesión de Derechos Patrimoniales">
      <Title
        text="Solicitud para firma de Rector"
        className="text-center text-gray-800 mb-3 text-lg"
      />
      <div className="flex flex-col space-y-4">
        {/* Componente para cargar el archivo del memorando */}
        <div>
          <label htmlFor="memoFile" className="block font-semibold">
            Suba el archivo del memorando para obtener el código
          </label>
          <UploadFile
            id="memo-file"
            onFileChange={handleMemoFileChange}
            label="Subir archivo del memorando"
          />
        </div>

        {/* Input para visualizar/editar el código obtenido */}
        <div>
          <label htmlFor="memoCode" className="block font-semibold">
            Código del memorando generado
          </label>
          <input
            id="memoCode"
            type="text"
            className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-[#931D21]"
            value={memoCode}
            onChange={(e) => setMemoCode(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && <div className="text-red-500">{error}</div>}

        <button
          type="button"
          className="w-full bg-[#931D21] hover:bg-[#7A171A] text-white py-2 rounded-lg font-semibold hover:scale-105 transition-transform duration-300 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading || !memoCode}
        >
          {loading ? "Enviando..." : "Siguiente"}
        </button>
      </div>
    </CardContainer>
  );
}
