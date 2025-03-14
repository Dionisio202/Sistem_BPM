import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import UploadFile from "./components/UploadFile";
//@ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import Title from "./components/TitleProps";
import Button from "../UI/button";
import { SERVER_BACK_URL } from "../../config.ts";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { useCombinedBonitaData } from "../bonita/hooks/obtener_datos_bonita.tsx";
import { ToastContainer, toast } from "react-toastify";

const socket = io(SERVER_BACK_URL);

export default function UploadForm() {
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const { usuario, bonitaData, tareaActual } = useCombinedBonitaData();
  const [memoCode, setMemoCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [json, setJson] = useState<temporalData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastCertification, setLastCertification] = useState<{
    fecha_doc: string;
    yaPasoUnAño: boolean;
  } | null>(null);
  const [forceNewUpload, setForceNewUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  //@ts-ignore
  const [processAdvanced, setProcessAdvanced] = useState(false);
  const bonita = new BonitaUtilities();

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

  useEffect(() => {
    const fetchLastDocument = async () => {
      try {
        const response = await fetch(
          `${SERVER_BACK_URL}/api/last-document?id_tipo_documento=5`
        );
        if (response.ok) {
          const data = await response.json();
          setLastCertification(data);
        } else {
          console.error("Error al obtener el último documento");
        }
      } catch (error) {
        console.error("Error en fetchLastDocument", error);
      }
    };

    fetchLastDocument();
  }, [isSubmitted]);

  const calculateRemainingTime = (fecha_doc: string) => {
    const fechaDocumento = new Date(fecha_doc);
    const fechaActual = new Date();
    const unAñoMs = 365 * 24 * 60 * 60 * 1000;
    const diffMs = fechaActual.getTime() - fechaDocumento.getTime();
    const remainingMs = unAñoMs - diffMs;
    if (remainingMs <= 0) return "0 días";
    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    return `${days} días y ${hours} horas`;
  };

  const handleMemoFileChange = useCallback(async (file: File | null) => {
    if (!file) return;

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
      { documento: memoBase64 },
      (response: any) => {
        if (response.success) {
          setMemoCode(response.codigo);
        } else {
          console.error("Error al subir el documento:", response.message);
          toast.error("Error al subir el documento");
        }
      }
    );
  }, []);

  const handleNext = useCallback(async () => {
    try {
      setLoading(true);

      // Verificar si hay una certificación subida
      if (!lastCertification) {
        throw new Error("No se ha subido una certificación presupuestaria.");
      }

      // Verificar si hay datos para guardar
      if (!json) {
        throw new Error("No hay datos para guardar.");
      }

      // Guardar el estado final
      const saveResponse = await saveFinalState(json);
      if (!saveResponse || typeof saveResponse.success !== "boolean") {
        throw new Error("Respuesta inválida al guardar el estado final.");
      }
      if (!saveResponse.success) {
        throw new Error(
          saveResponse.message ||
            "No se pudo guardar el estado final. Inténtelo de nuevo."
        );
      }

      // Cambiar la tarea en Bonita
      await bonita.changeTask();
      setProcessAdvanced(true);
    } catch (error) {
      console.error("Error en handleNext:", error);
    } finally {
      setLoading(false);
    }
  }, [json, saveFinalState, bonita, lastCertification]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!memoCode) {
        toast.error("Por favor, ingrese el código del memorando.");
        return;
      }
      if (!file && (forceNewUpload || !lastCertification)) {
        toast.error("Por favor, cargue un archivo de certificación.");
        return;
      }

      try {
        setLoading(true);
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          if (!file) return resolve("");
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result as string;
            const base64String = result.split(",")[1];
            resolve(base64String);
          };
          reader.onerror = (error) => reject(error);
        });

        const payload = {
          nombre: `${file?.name ?? ""}_${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}.pdf`,
          id_registro_per: `${bonitaData?.processId}-${bonitaData?.caseId}`,
          id_tipo_documento: "5",
          document: fileBase64,
          memorando: memoCode,
          id_tarea_per: `${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}`,
        };

        const response = await fetch(`${SERVER_BACK_URL}/api/get-document`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Respuesta del servidor:", data);

        setIsSubmitted(true);
        toast.success("Datos enviados correctamente.");
        setForceNewUpload(false);
      } catch (error) {
        console.error("Error en la solicitud:", error);
        toast.error("Ocurrió un error al enviar los datos.");
      } finally {
        setLoading(false);
      }
    },
    [memoCode, file, bonitaData, forceNewUpload, lastCertification]
  );

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg"
      >
        <Title
          text="Solicitud de Certificación Presupuestaria"
          size="2xl"
          className="text-center text-gray-800 mb-1 text-lg"
        />
        <h1 className="font-extralight text-center mb-8">
          Subir código y documento emitido para certificación.
        </h1>

        {lastCertification &&
        !lastCertification.yaPasoUnAño &&
        !forceNewUpload ? (
          <div className="mb-4 p-4 border rounded bg-gray-50">
            <p>
              Certificación presupuestaria subida el:{" "}
              {lastCertification.fecha_doc.split("T")[0]}
            </p>
            <p>
              Faltan: {calculateRemainingTime(lastCertification.fecha_doc)} para
              cumplir 1 año.
            </p>
            <Button
              type="button"
              className="mt-2 bg-green-600 text-white px-4 rounded hover:bg-green-700"
              onClick={() => setForceNewUpload(true)}
            >
              Subir nueva certificación
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <UploadFile
                id="memo-file"
                onFileChange={handleMemoFileChange}
                label="Subir archivo del memorando"
              />
            </div>

            <div className="mb-4">
              <UploadFile
                id="document-file"
                onFileChange={(file) => setFile(file)}
                label="Subir Certificación Presupuestaria"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="memoCode" className="block font-semibold">
                Código del memorando
              </label>
              <input
                id="memoCode"
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={memoCode}
                onChange={(e) => setMemoCode(e.target.value)}
                placeholder="El código se llenará automáticamente al cargar el archivo"
              />
            </div>

            <Button
              type="submit"
              className="mt-5 w-full bg-blue-600 text-white px-6 rounded hover:bg-blue-700"
            >
              Enviar Datos
            </Button>
          </>
        )}

        {!lastCertification && (
          <p className="text-red-500 text-sm mt-2">
            Debe subir una certificación presupuestaria antes de avanzar.
          </p>
        )}

        <Button
          className="mt-5 bg-[#931D21] text-white rounded-lg px-6 min-w-full hover:bg-blue-700 transition-colors duration-200"
          onClick={handleNext}
          disabled={loading || !lastCertification}
        >
          {loading ? (
            <div className="flex items-center">
              <span className="mr-2">Avanzando...</span>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </div>
          ) : (
            "Siguiente Proceso"
          )}
        </Button>
      </form>
      <ToastContainer />
    </div>
  );
}