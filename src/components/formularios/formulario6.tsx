import { useState, useEffect } from "react";
import DropdownCard from "./components/DropdownCard";
import DocumentViewer from "../files/DocumentViewer";
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import io from "socket.io-client";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { SERVER_BACK_URL } from "../../config.ts";
import { Tarea } from "../../interfaces/bonita.interface.ts";
import {ToastContainer} from "react-toastify";
import { useCombinedBonitaData } from "../bonita/hooks/obtener_datos_bonita.tsx";

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
  const bonita: BonitaUtilities = new BonitaUtilities();
  const [json, setJson] = useState<temporalData | null>(null);
  const [aprobado, setAprobado] = useState<boolean>(false);

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
            // Puedes manejar la respuesta según tus necesidades
          } else {
            console.error("Error del servidor:", response.message);
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
        nombre_tarea: tareaActual?.name || "",
      };
      setJson(data);
      startAutoSave(data, 10000, "En Proceso");
    }
  }, [bonitaData, usuario, startAutoSave, tareaActual,selectedDocuments]);

  // Guardado final
  const handleNext = async () => {
    if (json) {
      await saveFinalState(json);
    } else {
      console.error("❌ Error: json is null");
    }
    console.log("Aprobado", aprobado);
    bonita.changeTask({
      formData: {
      aprobadoInput:
      {
        aprobado: aprobado
      }
    },
    });

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
          className="w-40 bg-[#931D21] text-white p-2 rounded hover:bg-[#7A171A] transition duration-300"
          onClick={handleNext}
        >
          Siguiente
        </button>
        <div className="flex items-center">
  <input
    type="checkbox"
    className="h-6 w-6"
    id="aprobado"
    name="aprobado"
    onChange={(e) => setAprobado(e.target.checked)}
  />
  <label htmlFor="aprobado" className="ml-2">Aprobado</label>
</div>
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
      <ToastContainer/>
    </div>
  );
}