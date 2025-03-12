import { useState, useEffect } from "react";
import DocumentViewer from "../files/DocumentViewer";
//@ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import io from "socket.io-client";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { SERVER_BACK_URL } from "../../config.ts";
import { useCombinedBonitaData } from "../bonita/hooks/obtener_datos_bonita.tsx";
import { ToastContainer, toast } from "react-toastify";
import Button from "../UI/button.tsx";
import { FaFilePdf, FaFileWord } from "react-icons/fa"; // Íconos para los documentos

const socket = io(SERVER_BACK_URL);

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
  const bonita = new BonitaUtilities();
  const [json, setJson] = useState<temporalData | null>(null);
  const [aprobado, setAprobado] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [processAdvanced, setProcessAdvanced] = useState<boolean>(false);
  const [documentsGenerated, setDocumentsGenerated] = useState<boolean>(false);

  const handleViewDocument = async (documentType: string) => {
    const document = staticDocuments[documentType];
    if (document) {
      socket.emit(
        "generar_documentos",
        {
          id_registro: `${bonitaData?.processId}-${bonitaData?.caseId}`,
          id_tarea: bonitaData?.taskId,
        },
        (response: { success: boolean; message: string }) => {
          if (response.success) {
            console.log("Respuesta del servidor:", response.message);
            setDocumentsGenerated(true);
            toast.success("Documentos generados correctamente.");
          } else {
            console.error("Error del servidor:", response.message);
            toast.error("Error al generar los documentos.");
          }
        }
      );

      setSelectedDocuments(document);

      if (bonitaData && usuario) {
        const data: temporalData = {
          id_registro: `${bonitaData.processId}-${bonitaData.caseId}`,
          id_tarea: parseInt(bonitaData.taskId),
          jsonData: JSON.stringify(document),
          id_funcionario: parseInt(usuario.user_id),
          nombre_tarea: tareaActual?.name ?? "",
        };
        setJson(data);
        startAutoSave(data, 10000, "En Proceso");
      }
    }
  };

  const handleNext = async () => {
    try {
      if (!documentsGenerated) {
        toast.error("Debe generar los documentos antes de avanzar.");
        return;
      }

      if (!json) {
        throw new Error("No hay datos para guardar.");
      }

      setLoading(true);

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

      await bonita.changeTask({
        formData: {
          aprobadoInput: {
            aprobado: aprobado,
          },
        },
      });

      setProcessAdvanced(true);
    } catch (error) {
      console.error("Error en handleNext:", error);
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
    <div className="w-full h-full p-4 bg-gray-200 flex flex-col">
      {/* Menú de Documentos en la Parte Superior */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Generar Documentos</h2>
        <div className="flex flex-col space-y-4">
          {Object.entries(staticDocuments).map(([key, document]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => handleViewDocument(key)}
            >
              <div className="flex items-center">
                <FaFileWord className="text-blue-600 mr-3" size={20} />{" "}
                {/* Ícono de Word */}
                <span className="text-gray-700">{document.title}</span>
              </div>
              <button className="text-sm text-blue-500 hover:text-blue-700">
                Generar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Visualización del Documento Seleccionado */}
      <div className="flex-grow bg-white p-6 rounded-lg shadow-md">
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

      {/* Botones de Acción en la Parte Inferior */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant={aprobado ? "default" : "outline"}
          onClick={() => setAprobado(!aprobado)}
        >
          {aprobado
            ? "Regresar en el proceso (Punto de regreso: Atención de Solicitud de Registro de Propiedad Intelectual)"
            : "Desea regresar en el proceso"}
        </Button>
        <button
          className="w-40 bg-[#931D21] text-white p-2 rounded hover:bg-[#7A171A] transition duration-300"
          onClick={handleNext}
          disabled={loading || !documentsGenerated}
        >
          {loading ? "Cargando..." : "Siguiente"}
        </button>
      </div>

      {/* Mensaje de Advertencia */}
      {!documentsGenerated && (
        <p className="text-red-500 text-sm mt-4 text-center">
          Debe generar los documentos antes de avanzar.
        </p>
      )}

      <ToastContainer />
    </div>
  );
}
