import { useState, useEffect } from "react";
import CardContainer from "./components/CardContainer";
import UploadFile from "./components/UploadFile";
import io from "socket.io-client";
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import Button from "../UI/button";
import Title from "./components/TitleProps";
import { SERVER_BACK_URL } from "../../config.ts";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { useCombinedBonitaData } from "../bonita/hooks/obtener_datos_bonita.tsx";
import { ToastContainer, toast } from "react-toastify";

const socket = io(SERVER_BACK_URL);

export default function ConfirmationScreen() {
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const { usuario, bonitaData, tareaActual } = useCombinedBonitaData();
  const [json, setJson] = useState<temporalData | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDocumentUploaded, setIsDocumentUploaded] = useState(false); // Estado para controlar si el documento ha sido subido
  const bonita = new BonitaUtilities();
    // @ts-ignore
  const [processAdvanced, setProcessAdvanced] = useState(false);
  const handleNext = async () => {
    if (!isDocumentUploaded) {
      toast.error("Por favor, suba el documento antes de continuar.");
      return;
    }

    try {
      if (json) {
        await saveFinalState(json);
      } else {
        console.error("❌ Error: json is null");
      }
      await bonita.changeTask();
      setProcessAdvanced(true);
    } catch (error) {
      console.error("Error al cambiar la tarea:", error);
    }
  };

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

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Por favor, cargue un archivo.");
      return;
    }

    const fileName = file.name;
    const dotIndex = fileName.lastIndexOf(".");
    const baseName =
      dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName;

    const fileBase64: string = await new Promise((resolve, reject) => {
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
      nombre:
        baseName +
        `_${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}.pdf`,
      id_registro_per: `${bonitaData?.processId}-${bonitaData?.caseId}`,
      id_tipo_documento: "6",
      document: fileBase64,
      id_tarea_per: `${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}`,
    };

    try {
      const response = await fetch(`${SERVER_BACK_URL}/api/get-document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Respuesta del servidor:", data);
      setIsDocumentUploaded(true); // Marcar el documento como subido
      toast.success("Documento subido correctamente.");
    } catch (error) {
      console.error("Error en la solicitud:", error);
      toast.error("Error al subir el documento.");
    }
  };

  return (
    <CardContainer title="Certificado/Título de Registro">
      <div className="w-full max-w-lg p-6 rounded-lg shadow-lg">
        <Title
          text="Certificado/Título de Registro"
          size="2xl"
          className="text-center mb-1"
        />

        <UploadFile
          id="document-file"
          onFileChange={setFile}
          label="Subir el Certificado/Título de Registro"
        />

        <Button
          type="submit"
          className="mt-5 w-full bg-blue-600 text-white px-6 rounded hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Enviar Datos
        </Button>

        <Button
          className="w-full bg-[#931D21] hover:bg-[#7A171A] text-white py-2 rounded-lg font-semibold hover:scale-105 transition-transform duration-300 disabled:opacity-50"
          onClick={handleNext}
        >
          Siguiente Proceso
        </Button>
      </div>
      <ToastContainer />
    </CardContainer>
  );
}
