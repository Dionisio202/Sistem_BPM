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
import { useCombinedBonitaData } from "../bonita/hooks/obtener_datos_bonita.tsx";
import { ToastContainer, toast } from "react-toastify";

// Crear la instancia de Socket.io
const socket = io(SERVER_BACK_URL);

export default function MemoCodeForm() {
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const { usuario, bonitaData, tareaActual } = useCombinedBonitaData();
  const [memoCode, setMemoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false); // Estado para rastrear si el archivo se ha subido
  const bonita: BonitaUtilities = new BonitaUtilities();
  const id_tipo_documento = 3; // Valor de ejemplo, reemplazar según corresponda
  const [json, setJson] = useState<temporalData | null>(null);
  const [processAdvanced, setProcessAdvanced] = useState(false);
  // Obtener usuario autenticado
  useEffect(() => {
    if (bonitaData && usuario) {
      const data: temporalData = {
        id_registro: `${bonitaData.processId}-${bonitaData.caseId}`,
        id_tarea: parseInt(bonitaData.taskId),
        jsonData: JSON.stringify("No Form Data"),
        id_funcionario: parseInt(usuario.user_id),
        nombre_tarea: tareaActual?.name ?? "",
      };
      setJson(data);
      startAutoSave(data, 10000, "En Proceso");
    }
  }, [bonitaData, usuario, startAutoSave, tareaActual]);

  // Función para manejar la carga del archivo del memorando y obtener el código mediante Socket.io
  const handleMemoFileChange = useCallback(
    async (file: File | null) => {
      if (!file) {
        setError("Debes seleccionar un archivo para continuar.");
        return;
      }

      try {
        setLoading(true);
        setError("");
        setFileUploaded(false); // Reiniciar el estado de subida del archivo

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
              setFileUploaded(true); // Marcar el archivo como subido correctamente
              toast.success("Archivo subido correctamente.");
            } else {
              setError("No se pudo obtener el código del memorando.");
              toast.error("Error al subir el archivo.");
            }
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error al obtener el código del memorando:", err);
        setError("Error al obtener el código del memorando. Intente nuevamente.");
        toast.error("Error al procesar el archivo.");
        setLoading(false);
      }
    },
    [id_tipo_documento, bonitaData]
  );

  // Función para continuar con el proceso usando el código obtenido
  const handleSubmit = async () => {
    try {
      setError("");
      // Validar que el archivo se haya subido y el código esté disponible
      if (!fileUploaded || !memoCode) {
        toast.error("Debes subir el archivo y obtener el código para continuar.");
        return;
      }
      // Guardar el estado final
      if (json) {
        await saveFinalState(json);
      } else {
        console.error("❌ Error: json is null");
      }
      await bonita.changeTask();
      setProcessAdvanced(true);
      // Enviar el código del memorando al endpoint de guardado
      const response = await fetch(
        `${SERVER_BACK_URL}/api/save-memorando?key=${memoCode}&id_tipo_documento=${id_tipo_documento}&id_registro=${bonitaData?.processId}-${bonitaData?.caseId}&id_tarea_per=${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}`
      );

      if (!response.ok) {
        throw new Error("Error al guardar el memorando");
      }

      const data = await response.json();
      console.log("Memorando guardado:", data);
      toast.success("Memorando guardado correctamente.");
    } catch (err) {
      setError("Error al guardar el memorando. Verifica el código e intenta nuevamente.");
      console.error("Error:", err);
      toast.error("Error al guardar el memorando.");
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
          disabled={loading || !memoCode || !fileUploaded} // Deshabilitar si no hay código o el archivo no se ha subido
        >
          {loading ? "Enviando..." : "Siguiente"}
        </button>
      </div>
      <ToastContainer />
    </CardContainer>
  );
}