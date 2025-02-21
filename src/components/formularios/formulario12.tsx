import { useEffect, useState } from "react";
import DocumentViewer from "../files/DocumentViewer"; // Importa tu componente de visor de documentos
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import { useBonitaService } from "../../services/bonita.service";
import io from "socket.io-client";
import { SERVER_BACK_URL } from "../../config.ts";

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

export default function WebPage() {
  // @ts-ignore
  const { obtenerUsuarioAutenticado, obtenerDatosBonita, error } = useBonitaService();
  const urlSave = `${SERVER_BACK_URL}/api/save-document`;
  const [codigo, setCodigo] = useState(""); // Código del comprobante
  const [codigoGuardado, setCodigoGuardado] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const bonita: BonitaUtilities = new BonitaUtilities();
  const [codigoalmacenamiento, setCodigoAlmacenamiento] = useState<string>("");
  const [selectedDocument, setSelectedDocument] = useState<DocumentType>(staticDocuments.datos);
  const [usuario, setUsuario] = useState<{ user_id: string; user_name: string } | null>(null);
  const [bonitaData, setBonitaData] = useState<{
    processId: string;
    taskId: string;
    caseId: string;
    processName: string;
  } | null>(null);

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodigo(e.target.value);
  };

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
        const response = await fetch(
          `${SERVER_BACK_URL}/api/update-document?codigo_almacenamiento=${codigoalmacenamiento}&codigo_documento=${codigo}`
        );
        if (!response.ok) {
          throw new Error("Error al guardar el memorando");
        }
        const data = await response.json();
        console.log("Memorando guardado:", data);
        
      } catch (err) {
        console.error("Error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl justify-center font-bold mb-6">
        Comprobante de Pago Registro de Propiedad Intelectual
      </h1>

      {/* DocumentViewer para mostrar el documento siempre */}
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-4 mb-8">
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

      {/* Input para ingresar el código del memorando */}
      <div className="w-full max-w-md">
        <label htmlFor="codigo" className="block text-gray-700 font-medium mb-2">
          Ingrese el código del Memorando emitido a Vicerrectorado
        </label>
        <input
          id="codigo"
          type="text"
          value={codigo}
          onChange={handleCodigoChange}
          className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ingrese el código del Memorando"
        />
        <button
          onClick={handleSiguiente}
          className="w-full bg-[#931D21] text-white py-2 rounded hover:bg-gray-400 transition duration-300"
        >
          Siguiente
        </button>
      </div>

      {/* Mostrar el código guardado solo si existe */}
      {codigoGuardado && (
        <p className="mt-4 text-black-600 font-medium">Código guardado: {codigoGuardado}</p>
      )}

      {/* Mostrar mensaje de alerta */}
      {alertMessage && (
        <div className="mt-4 p-2 bg-yellow-200 text-black rounded">{alertMessage}</div>
      )}
    </div>
  );
}
