import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import CardContainer from "./components/CardContainer";
import UploadFile from "./components/UploadFile";
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import Title from "./components/TitleProps";
import { SERVER_BACK_URL } from "../../config.ts";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { useCombinedBonitaData } from "../bonita/hooks/obtener_datos_bonita.tsx";
import { ToastContainer, toast } from "react-toastify";

const socket = io(SERVER_BACK_URL);



export default function MemoCodeForm() {
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const { usuario, bonitaData, tareaActual } = useCombinedBonitaData();
  const [memoCode, setMemoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const bonita: BonitaUtilities = new BonitaUtilities();
  const id_tipo_documento = 3;
  const [json, setJson] = useState<temporalData | null>(null);
  const [_processAdvanced, setProcessAdvanced] = useState(false);

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

  const handleMemoFileChange = useCallback(
    async (file: File | null) => {
      if (!file) {
        setError("Debes seleccionar un archivo para continuar.");
        return;
      }
      try {
        setLoading(true);
        setError("");
        setFileUploaded(false);
        setMemoCode(""); // Resetear el código al subir un nuevo archivo

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

        socket.emit(
          "subir_documento",
          {
            documento: memoBase64,
            id_tipo_documento,
            id_registro: `${bonitaData?.processId}-${bonitaData?.caseId}`,
          },
          (response: any) => {
            // Verificar si la respuesta es exitosa Y el código no es "no encontrado" o similar
            if (
              response.success &&
              response.codigo &&
              !response.codigo.toLowerCase().includes("no encontrado") &&
              response.codigo.trim() !== ""
            ) {
              setMemoCode(response.codigo);
              setFileUploaded(true);
              toast.success("Archivo subido correctamente. Puede Continuar");
            } else {
              // Si la respuesta indica éxito pero el código tiene formato incorrecto
              if (
                response.success &&
                response.codigo &&
                (response.codigo.toLowerCase().includes("no encontrado") ||
                  response.codigo.trim() === "")
              ) {
                setError(
                  "El documento subido no es válido o no se puede procesar."
                );
                setMemoCode("");
                setFileUploaded(false);
                toast.error(
                  "Documento inválido. Por favor, suba un documento válido."
                );
              } else {
                // Error general
                setError(
                  response.message ||
                    "No se pudo obtener el código del memorando."
                );
                setMemoCode("");
                setFileUploaded(false);
                toast.error("Error al subir el archivo.");
              }
            }
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error al obtener el código del memorando:", err);
        toast.error(
          "Error al obtener el código del memorando. Intente nuevamente."
        );
        setMemoCode("");
        setFileUploaded(false);
        toast.error("Error al procesar el archivo.");
        setLoading(false);
      }
    },
    [id_tipo_documento, bonitaData]
  );

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Validaciones iniciales
      if (!fileUploaded || !memoCode) {
        throw new Error(
          "Debes subir el archivo y obtener el código para continuar."
        );
      }

      if (!json) {
        throw new Error("No hay datos para guardar.");
      }

      // PRIORIDAD 1: Guardar estado final y verificar respuesta
      const saveResponse = await saveFinalState(json);

      // Verificar que la respuesta sea válida y exitosa
      if (!saveResponse || typeof saveResponse.success !== "boolean") {
        throw new Error("Respuesta inválida al guardar el estado final.");
      }

      if (!saveResponse.success) {
        throw new Error(
          saveResponse.message ||
            "No se pudo guardar el estado final. Inténtelo de nuevo."
        );
      }

      // PRIORIDAD 2: Solo si el guardado fue exitoso, cambiar tarea en Bonita
      await bonita.changeTask();
      setProcessAdvanced(true);

      // Guardar memorando
      if (!bonitaData) {
        throw new Error("No se encuentran datos del proceso Bonita.");
      }

      const response = await fetch(
        `${SERVER_BACK_URL}/api/save-memorando?key=${memoCode}&id_tipo_documento=${id_tipo_documento}&id_registro=${bonitaData.processId}-${bonitaData.caseId}&id_tarea_per=${bonitaData.processId}-${bonitaData.caseId}-${bonitaData.taskId}`
      );

      if (!response.ok) {
        throw new Error("Error al guardar el memorando");
      }

      const data = await response.json();
      console.log("Memorando guardado:", data);
      toast.success("Memorando guardado correctamente.");
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [
    json,
    saveFinalState,
    bonita,
    fileUploaded,
    memoCode,
    id_tipo_documento,
    bonitaData,
  ]);

  return (
    <CardContainer title="Contrato Cesión de Derechos Patrimoniales">
      <Title
        text="Solicitud para firma de Rector"
        className="text-center text-gray-800 mb-3 text-lg"
      />
      <div className="flex flex-col space-y-4">
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
          disabled={loading || !memoCode || !fileUploaded}
        >
          {loading ? "Enviando..." : "Siguiente"}
        </button>
      </div>
      <ToastContainer />
    </CardContainer>
  );
}
