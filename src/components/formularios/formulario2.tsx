import { useState, useEffect, useRef } from "react";
import { EmailInput } from "./components/EmailInput";
import DocumentViewer from "../files/DocumentViewer";
import Title from "./components/TitleProps";
import io from "socket.io-client";
import { SERVER_BACK_URL } from "../../config.ts";
import { useBonitaService } from "../../services/bonita.service";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { Tarea } from "../../interfaces/bonita.interface.ts";

// Fuera del componente, crea una única instancia de socket
const socket = io(SERVER_BACK_URL);

// Definimos un tipo para los documentos
type DocumentType = {
  key: string;
  title: string;
  nombre: string;
};

// Documentos precargados (estáticos)
const staticDocuments: Record<string, DocumentType> = {
  datos: {
    key: "jfda-001",
    title: "Formato_datos_informativos_autores",
    nombre: "jfda-001.docx",
  },
  otroDocumento: {
    key: "jfsr-001",
    title: "Formato_solicitud_registro",
    nombre: "jfsr-001.docx",
  },
};

export default function WebPage() {
  const urlSaveDocument = SERVER_BACK_URL + "/api/save-document";
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(
    null
  );
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const { startAutoSave, stopAutoSave, saveFinalState } = useSaveTempState(
    socket,
    { intervalRef }
  );
  const [teareaActual, setTareaActual] = useState<Tarea | null>(null);
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
  const [json, setJson] = useState<temporalData | null>(null);
  // @ts-ignore
  const [loading, setLoading] = useState<boolean>(false);
  // @ts-ignore

  const [error, setError] = useState<string | null>(null);
  // @ts-ignore
  // Usamos el servicio actualizado de Bonita (solo con las APIs públicas)
  const { obtenerDatosBonita, obtenerUsuarioAutenticado, obtenerTareaActual } =
    useBonitaService();

  // Verificar conexión WebSocket
  useEffect(() => {
    const handleConnect = () => {
      if (process.env.NODE_ENV === "development") {
        console.log("Conectado al servidor WebSocket");
      }
    };

    const handleConnectError = (err: Error) => {
      console.error("Error de conexión WebSocket:", err);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
    };
  }, []);

  // Obtener datos de Bonita (usuario y tarea actual) y enviarlos al backend
  useEffect(() => {
    let isMounted = true;

    const fetchBonitaData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Obtener el usuario autenticado
        const usuario = await obtenerUsuarioAutenticado();
        setUsuario(usuario);
        if (usuario) {
          // 2. Obtener la tarea actual y demás datos asociados (a través de obtenerDatosBonita)
          const tareaData = await obtenerTareaActual(usuario.user_id);
          setTareaActual(tareaData);
          const bonitaData = await obtenerDatosBonita(usuario.user_id);
          setBonitaData(bonitaData);
          if (bonitaData && isMounted) {
            console.log("Datos de Bonita obtenidos:", bonitaData);
            //Preparar el json de envio de datos al backend
            const data = {
              id_proceso: bonitaData.processId,
              nombre_proceso: bonitaData.processName,
              id_funcionario: usuario.user_id,
              id_caso: bonitaData.caseId,
            };
            // Enviar los datos al backend vía WebSocket
            socket.emit("iniciar_registro", data, (response: any) => {
              console.log("Respuesta completa del backend:", response);
              if (response.success) {
                console.log("Datos enviados correctamente.");
              } else {
                console.error("Error en el backend:", response.message);
              }
            });
          }
        }
      } catch (error) {
        console.error("Error en la carga de datos de Bonita:", error);
        setError(
          `Error en la carga de datos: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBonitaData();

    return () => {
      isMounted = false;
    };
  }, [obtenerDatosBonita, obtenerUsuarioAutenticado]);

  // 🔹 Iniciar el guardado automático ("En Proceso")
  useEffect(() => {
    if (bonitaData && usuario) {
      const data: temporalData = {
        id_registro: `${bonitaData.processId}-${bonitaData.caseId}`,
        id_tarea: parseInt(bonitaData.taskId),
        jsonData: JSON.stringify(selectedDocs),
        id_funcionario: parseInt(usuario.user_id),
      };
      setJson(data);
      startAutoSave(data, 10000, "En Proceso");
    }
  }, [bonitaData, usuario, startAutoSave]);

  // Seleccionar documento a visualizar
  const handleViewDocument = (documentType: keyof typeof staticDocuments) => {
    const document = staticDocuments[documentType];
    setSelectedDocument(document);
  };

  // Marcar o desmarcar documento
  const handleCheckboxChange = (documentType: keyof typeof staticDocuments) => {
    setSelectedDocs((prev) => {
      const newSelectedDocs = new Set(prev);
      if (newSelectedDocs.has(documentType)) {
        newSelectedDocs.delete(documentType);
      } else {
        newSelectedDocs.add(documentType);
      }
      return newSelectedDocs;
    });
  };

  const documentList = [
    { type: "datos", label: "Formato datos informativos de autores" },
    { type: "otroDocumento", label: "Formato Solicitud de registro" },
  ];

  return (
    <div className="flex w-full h-full p-2 bg-gray-200">
      <div className="flex w-full h-full flex-col md:flex-row gap-4 mt-4">
        {/* Panel Izquierdo - Tabla de documentos y correos */}
        <div className="w-full md:w-1/4 space-y-4">
          <Title
            text="Asesoramiento Registro Propiedad Intelectual"
            size="2xl"
            className="text-center text-gray-800 mb-4 text-xl"
          />
          {/* Tabla de documentos */}
          <div className="w-full overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-1 text-left text-xs">Documento</th>
                  <th className="px-4 py-1 text-left text-xs">Acción</th>
                </tr>
              </thead>
              <tbody>
                {documentList.map((doc) => (
                  <tr key={doc.type} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-1 text-xs">{doc.label}</td>
                    <td className="px-4 py-1 text-xs flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedDocs.has(doc.type)}
                        onChange={() =>
                          handleCheckboxChange(
                            doc.type as keyof typeof staticDocuments
                          )
                        }
                        className="h-4 w-4"
                      />
                      <button
                        onClick={() =>
                          handleViewDocument(
                            doc.type as keyof typeof staticDocuments
                          )
                        }
                        className="bg-[#931D21] text-white py-1 px-4 rounded hover:bg-blue-500 transition duration-300"
                      >
                        Visualizar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Input de correos */}
          <div className="mt-3 md:w-8/4">
            <EmailInput
              json={json}
              socket={socket}
              stopAutoSave={stopAutoSave} // ✅ Nueva prop
              saveFinalState={saveFinalState} // ✅ Nueva prop
            />
          </div>
        </div>

        {/* Panel Derecho - Visor de documentos */}
        <div className="w-full h-full md:w-3/4 pl-6 mt-0.5">
          {selectedDocument ? (
            <DocumentViewer
              keyDocument={selectedDocument.key}
              title={selectedDocument.title}
              documentName={selectedDocument.nombre}
              mode="edit"
              callbackUrl={urlSaveDocument}
            />
          ) : (
            <p className="text-center text-gray-500">
              Selecciona un documento para visualizarlo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}