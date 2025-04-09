import { useState, useEffect } from "react";
import DropdownCard from "./components/DropdownCard";
import DocumentViewer from "../files/DocumentViewer";
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import io from "socket.io-client";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { SERVER_BACK_URL } from "../../config.ts";
import { useCombinedBonitaData } from "../bonita/hooks/obtener_datos_bonita.tsx";
import { ToastContainer, toast } from "react-toastify";

const socket = io(SERVER_BACK_URL,{
  path: "/doc/socket.io",
  transports: ['websocket'],
  secure: true,
  rejectUnauthorized: false 
});
type StaticDocument = {
  key: string;
  title: string;
  nombre: string;
};

export default function Formulario6() {
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const { usuario, bonitaData, tareaActual } = useCombinedBonitaData();
  const urlSave = `${SERVER_BACK_URL}api/save-document`;
  const [selectedDocuments, setSelectedDocuments] =
    useState<StaticDocument | null>(null);
  const bonita: BonitaUtilities = new BonitaUtilities();
  const [json, setJson] = useState<temporalData | null>(null);
  // @ts-ignore
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const [processAdvanced, setProcessAdvanced] = useState(false);
  // New state to track if documents were generated
  const [documentsGenerated, setDocumentsGenerated] = useState(false);

  // Modificamos la función para aceptar un string
  const handleViewDocument = async (documentType: string) => {
    const document = staticDocuments[documentType];
    if (document) {
      // Emitir evento al servidor para verificar o generar el documento id_registro, id_tarea
      socket.emit(
        "generar_documentos",
        {
          id_registro: bonitaData?.processId + "-" + bonitaData?.caseId,
          id_tarea: bonitaData?.taskId,
        },
        (response: any) => {
          if (response.success) {
            console.log("Respuesta del servidor:", response.message);
            // Mark documents as generated when successful
            setDocumentsGenerated(true);
          } else {
            console.error("Error del servidor:", response.message);
            toast.error("Error al generar documentos: " + response.message);
            setDocumentsGenerated(false);
          }
        }
      );

      setSelectedDocuments(document);
    }
  };

  // Obtener usuario autenticado
  useEffect(() => {
    if (bonitaData && usuario) {
      const data: temporalData = {
        id_registro: `${bonitaData.processId}-${bonitaData.caseId}`,
        id_tarea: parseInt(bonitaData.taskId),
        jsonData: JSON.stringify(selectedDocuments),
        id_funcionario: parseInt(usuario.user_id),
        nombre_tarea: tareaActual?.name ?? "",
        eliminar_documentos: true,
      };
      setJson(data);
      startAutoSave(data, 10000, "En Proceso");
    }
  }, [bonitaData, usuario, startAutoSave, tareaActual, selectedDocuments]);

  // Guardado final
  const handleNext = async () => {
    // Check if documents were generated before proceeding
    if (!documentsGenerated) {
      toast.error("Por favor, genere los documentos antes de continuar");
      return;
    }

    // Also check if a document was selected
    if (!selectedDocuments) {
      toast.error("Por favor, seleccione un documento antes de continuar");
      return;
    }

    try {
      if (json) {
        setLoading(true);
        const saveResponse = await saveFinalState(json);
        if (!saveResponse || typeof saveResponse.success !== "boolean") {
          throw new Error("Respuesta inválida al guardar el estado final.");
        }
        if (!saveResponse.success) {
          toast.error(
            saveResponse.message ||
              "No se pudo guardar el estado final. Inténtelo de nuevo."
          );
        }
      } else {
        console.error("❌ Error: json is null");
      }
      bonita.changeTask();
      setProcessAdvanced(true);
    } catch (error) {
      toast.error(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const nombrePlantilla1 = "Contrato_Cesion_Derechos";
  const nombrePlantilla2 = "Acta_Porcentaje_Participacion";
  const codigoProceso = `${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}`;
  const staticDocuments: Record<string, StaticDocument> = {
    "Contrato Cesion de Derechos": {
      key: `${nombrePlantilla1}_${codigoProceso}`,
      title: "Contrato Cesión de Derechos",
      nombre: `${nombrePlantilla1}_${codigoProceso}.docx`,
    },
    "Acta de Participación": {
      key: `${nombrePlantilla2}_${codigoProceso}`,
      title: "Acta de Participación",
      nombre: `${nombrePlantilla2}_${codigoProceso}.docx`,
    },
  };
  return (
    <div className="w-full h-full p-4 bg-gray-200 flex flex-col justify-between">
      <div className="flex flex-row items-center gap-4 py-6">
        <DropdownCard
          options={Object.keys(staticDocuments)}
          onSelect={handleViewDocument}
          defaultLabel="Selecciona un documento"
        />
        <button
          className={`w-40 text-white p-2 rounded transition duration-300 ${
            documentsGenerated && selectedDocuments
              ? "bg-[#931D21] hover:bg-[#7A171A]"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={handleNext}
          disabled={!documentsGenerated || !selectedDocuments}
        >
          Siguiente
        </button>
      </div>

      <div className="flex-grow">
        {selectedDocuments ? (
          <DocumentViewer
            keyDocument={selectedDocuments.key}
            title={selectedDocuments.title}
            documentName={selectedDocuments.nombre}
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