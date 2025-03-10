import { useEffect, useState } from "react";
import DocumentViewer from "../files/DocumentViewer"; // Importa tu componente de visor de documentos
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import { useBonitaService } from "../../services/bonita.service";
import io from "socket.io-client";
import { SERVER_BACK_URL } from "../../config.ts";
import CardContainer from "./components/CardContainer.tsx";
import { EmailInput } from "./components/EmailInput.tsx";

const socket = io(SERVER_BACK_URL);

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
  // @ts-ignore
  const { obtenerUsuarioAutenticado, obtenerDatosBonita, error } = useBonitaService();
  const urlSave = `${SERVER_BACK_URL}/api/save-document`;
  const [codigo, setCodigo] = useState(""); // Código del comprobante
  const [, setCodigoGuardado] = useState<string | null>(null);
  const [, setAlertMessage] = useState<string | null>(null);
  const bonita: BonitaUtilities = new BonitaUtilities();
  const [, setCodigoAlmacenamiento] = useState<string>("");
  const [selectedDocument, setSelectedDocument] = useState<DocumentType>(staticDocuments.datos);
  const [usuario, setUsuario] = useState<{ user_id: string; user_name: string } | null>(null);
  const [bonitaData, setBonitaData] = useState<{
    processId: string;
    taskId: string;
    caseId: string;
    processName: string;
  } | null>(null);

  

  // 🔹 Obtener el usuario autenticado
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await obtenerUsuarioAutenticado();
      if (userData) {
        setUsuario(userData);
      }
    };
    fetchUser();
  }, [obtenerUsuarioAutenticado]);

  // 🔹 Obtener datos de Bonita cuando ya se tenga el usuario
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

  // 🔹 Emitir el evento socket para obtener el código de almacenamiento cuando la data de Bonita esté disponible
  useEffect(() => {
    if (bonitaData) {
      socket.emit(
        "obtener_codigo_almacenamiento",
        { id_registro: `${bonitaData.processId}-${bonitaData.caseId}`, id_tipo_documento: 6 },
        (response: any) => {
          if (response.success) {
            console.log("Dato recibido:", response.jsonData);
            setCodigoAlmacenamiento(response.jsonData);
            setSelectedDocument({
              key: response.jsonData,
              title: staticDocuments.datos.title,
              nombre: `${response.jsonData}.pdf`,
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

  const handleSiguiente = async () => {
    if (codigo.trim() !== "") {
      setCodigoGuardado(codigo);
      try {
        setCodigo("");
        bonita.changeTask();
        setAlertMessage("Avanzando a la siguiente página...");
        
        
      } catch (err) {
        console.error("Error:", err);
      }
    }
  };

  return (
 <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <CardContainer title="Certificado">
        <div className="flex flex-col space-y-6 h-full">
          {/* Sección para visualizar el documento usando DocumentViewer */}
          <div className="w-full p-4 border rounded-lg shadow-sm bg-gray-100 text-center">
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

          {/* Sección para el EmailInput */}
          <div className="flex-1 w-full h-full">
            <EmailInput />
          </div>

          {/* Botón Siguiente */}
          <button
            type="button"
            className="w-full bg-[#931D21] hover:bg-[#7A171A] text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-300"
            onClick={handleSiguiente}
          >
            Siguiente
          </button>
        </div>
      </CardContainer>
    </div>
  );
}
