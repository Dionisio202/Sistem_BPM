import { useState, useEffect, useRef } from "react";
import DocumentViewer from "../files/DocumentViewer"; //
import io from "socket.io-client";
import { SERVER_BACK_URL } from "../../config.ts";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { EmailInput } from "./components/EmailInput.tsx";
import { useCombinedBonitaData } from "../bonita/hooks/obtener_datos_bonita.tsx";
import { ToastContainer } from "react-toastify";
import Title from "./components/TitleProps.tsx";
const socket = io(SERVER_BACK_URL,{
  path: "/doc/socket.io",
  transports: ['websocket'],
  secure: true,
  rejectUnauthorized: false 
});

type DocumentType = {
  key: string;
  title: string;
  nombre: string;
};

const staticDocuments: Record<string, DocumentType> = {
  datos: {
    key: "Formato_datos_informativos_autores_3-Test001",
    title: "Comprobante de Pago",
    nombre: "Formato_datos_informativos_autores_3-Test001.pdf",
  },
};

export default function ConfirmationScreen() {
  const { usuario, bonitaData, tareaActual } = useCombinedBonitaData();
  const [json, setJson] = useState<temporalData | null>(null);
  const urlSave = `${SERVER_BACK_URL}/doc/api/save-document`;

  const [, setCodigoAlmacenamiento] = useState<string>("");
  const [selectedDocument, setSelectedDocument] = useState<DocumentType>(
    staticDocuments.datos
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { startAutoSave, stopAutoSave, saveFinalState } = useSaveTempState(
    socket,
    { intervalRef }
  );

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

  // 🔹 Emitir el evento socket para obtener el código de almacenamiento cuando la data de Bonita esté disponible
  useEffect(() => {
    if (bonitaData) {
      socket.emit(
        "obtener_codigo_almacenamiento",
        {
          id_registro: `${bonitaData.processId}-${bonitaData.caseId}`,
          id_tipo_documento: 6,
        },
        (response: any) => {
          if (response.success) {
            console.log("Dato recibido:", response.jsonData);
            setCodigoAlmacenamiento(response.jsonData);
            setSelectedDocument({
              key: response.jsonData,
              title: staticDocuments.datos.title,
              nombre: `${response.jsonData}`,
            });
          } else {
            console.error("Error:", response.message);
          }
        }
      );
    }
    return () => {
      socket.off("obtener_codigo_almacenamiento");
    };
  }, [bonitaData]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <Title text="Entrega Certificado Titulo de Registro" className="text-center mb-6" />
        <div className="flex flex-col space-y-8">
          {/* Sección para visualizar el documento usando DocumentViewer */}
          <div className="w-full flex justify-center">
            <div className="w-full h-full">
              <DocumentViewer
                keyDocument={selectedDocument.key}
                title={selectedDocument.title}
                documentName={selectedDocument.nombre}
                mode="view"
                fileType="pdf"
                documentType="pdf"
                callbackUrl={urlSave}
              />
            </div>
          </div>

          {/* Sección para el EmailInput */}
          <div className="w-full">
            <EmailInput
              json={json}
              socket={socket}
              stopAutoSave={stopAutoSave}
              saveFinalState={saveFinalState}
              attachments={[selectedDocument.nombre]} // Archivos a enviar (dinámico)
              docBasePath={"/app/documents"} // Ruta base (dinámica)
            />
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}
