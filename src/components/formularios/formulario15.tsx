import { useState, useEffect } from "react";
import io from "socket.io-client";
import DropdownCard from "./components/DropdownCard"; // Componente para el dropdown
import DocumentViewer from "../files/DocumentViewer"; // Componente para visualizar el documento
import Button from "../UI/button"; // Componente botón
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import { SERVER_BACK_URL } from "../../config.ts";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { useCombinedBonitaData } from "../bonita/hooks/obtener_datos_bonita.tsx";
import { ToastContainer, toast } from "react-toastify";

const socket = io(SERVER_BACK_URL,{
  path: "/doc/socket.io",
  transports: ['websocket'],
  secure: true,
  rejectUnauthorized: false 
});

// Definimos un tipo para nuestros documentos
type StaticDocument = {
  key: string;
  title: string;
  nombre: string;
};

export default function Formulario6() {
  const urlSave = `${SERVER_BACK_URL}/doc/api/save-document`;
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const { usuario, bonitaData, tareaActual } = useCombinedBonitaData();
  // Estado para almacenar el documento seleccionado
  const [selectedDocument, setSelectedDocument] =
    useState<StaticDocument | null>(null);
  const bonita: BonitaUtilities = new BonitaUtilities();
  const [json, setJson] = useState<temporalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [_processAdvanced, setProcessAdvanced] = useState(false);
  const handleNext = async () => {
    if (!json) {
      toast.error("No hay datos para guardar.");
      return;
    }
    try {
      setLoading(true); // Activar el estado de loading
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
      await bonita.changeTask();
      setProcessAdvanced(true);
    } catch (error) {
      console.error("Error en handleNext:", error);
    } finally {
      setLoading(false); 
    }
  };
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

  const nombrePlantilla = "fsvt-001";
  const codigoProceso = `${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}`;
  const staticDocuments: Record<string, StaticDocument> = {
    //valores a enviar
    "Validación de Transferencias": {
      key: `${nombrePlantilla}-${codigoProceso}`,
      title: "Validación",
      nombre: `${nombrePlantilla}-${codigoProceso}.docx`,
    },
  };

  // Función para seleccionar el documento a visualizar y llamar a la API de verificación
  const handleViewDocument = async (
    documentType: keyof typeof staticDocuments
  ) => {
    const document = staticDocuments[documentType];

    if (documentType === "Validación de Transferencias") {
      try {
        // Llamada a la API usando los valores del documento estático
        const apiUrl = `${SERVER_BACK_URL}/doc/api/verificar-documento?key=${document.key}&nombre=${nombrePlantilla}.docx&id_registro_per=${bonitaData?.processId}-${bonitaData?.caseId}&id_tipo_documento=3&id_tarea_per=${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log("Respuesta de la API:", data);
        // Aquí puedes procesar 'data' para actualizar información del documento si es necesario
      } catch (error) {
        console.error("Error al llamar a la API:", error);
      }
    }
    setSelectedDocument(document);
  };

  return (
    <div className="w-full h-full p-4 bg-gray-200 flex flex-col justify-between">
      {/* Contenedor superior con Dropdown y botón */}
      <div className="flex flex-row items-center gap-4 py-6">
        <DropdownCard
          options={Object.keys(staticDocuments)}
          onSelect={handleViewDocument}
          defaultLabel="Selecciona un documento"
        />
         <Button
          className="w-full bg-[#931D21] hover:bg-[#7A171A] text-white py-2 rounded-lg font-semibold hover:scale-105 transition-transform duration-300 disabled:opacity-50"
          onClick={handleNext}
          disabled={loading} // Deshabilitar si no se ha subido el archivo
        >
          {loading ? "Cargando..." : "Siguiente Proceso"}
        </Button>
      </div>

      <div className="flex-grow">
        {selectedDocument ? (
          <DocumentViewer
            keyDocument={selectedDocument.key}
            title={selectedDocument.title}
            documentName={selectedDocument.nombre}
            mode="edit"
            callbackUrl={urlSave}
          />
        ) : (
          <p className="text-center text-gray-500">
            Selecciona un documento para visualizarlo
          </p>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
