import { useState, useEffect } from "react";
import DropdownCard from "./components/DropdownCard";
import DocumentViewer from "../files/DocumentViewer";
// @ts-ignore
import BonitaUtilities  from "../bonita/bonita-utilities";
import io from "socket.io-client";
import { useBonitaService } from "../../services/bonita.service";
import { SERVER_BACK_URL } from "../../config.ts";

const socket = io(SERVER_BACK_URL);
type StaticDocument = {
  key: string;
  title: string;
  nombre: string;
};

export default function Formulario6() {
  const { obtenerUsuarioAutenticado, obtenerDatosBonita } = useBonitaService();
  const urlSave = `${SERVER_BACK_URL}api/save-document`;
  const [selectedDocument, setSelectedDocument] = useState<StaticDocument | null>(null);
  const bonita: BonitaUtilities = new BonitaUtilities();

  // Modificamos la función para aceptar un string
  const handleViewDocument = async (documentType: string) => {
    const document = staticDocuments[documentType];
    if (document) {
      // Emitir evento al servidor para verificar o generar el documento id_registro, id_tarea 
      socket.emit('generar_documentos', { id_registro:(bonitaData?.processId + '-'+ bonitaData?.caseId), id_tarea: bonitaData?.taskId}, (response:any) => {
        if (response.success) {
          console.log('Respuesta del servidor:', response.message);
          // Puedes manejar la respuesta según tus necesidades
        } else {
          console.error('Error del servidor:', response.message);
        }
      });

      setSelectedDocument(document);
    }
  };

  
  // Obtener datos del formulario
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
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await obtenerUsuarioAutenticado();
      if (userData) setUsuario(userData);
    };
    fetchUser();
  }, []);
  useEffect(() => {
    if (!usuario) return;
    const fetchData = async () => {
      try {
        const data = await obtenerDatosBonita(usuario.user_id);
        if (data) {
          setBonitaData(data);
        }
      } catch (error) {
        console.error("❌ Error obteniendo datos de Bonita:", error);
      }
    };
    fetchData();
  }, [usuario, obtenerDatosBonita]);
  const handleNext = () => {
    alert("Avanzando a la siguiente página...");
    bonita.changeTask();
  };
  const nombrePlantilla1="Contrato_Cesion_Derechos";
  const nombrePlantilla2="Acta_Porcentaje_Participacion";
  const codigoProceso=`${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}`;
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
      </div>

      <div className="flex-grow">
        {selectedDocument ? (
          <DocumentViewer
            keyDocument={selectedDocument.key}
            title={selectedDocument.title}
            documentName={selectedDocument.nombre}
             mode="edit"
            callbackUrl= {urlSave}
          />
        ) : (
          <p className="text-center text-gray-500">
            Selecciona un documento para visualizarlo
          </p>
        )}
      </div>
    </div>
  );
}