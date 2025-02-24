import { useEffect, useState, useCallback } from "react";
import DocumentViewer from "../files/DocumentViewer"; // Componente para mostrar documentos
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import { useBonitaService } from "../../services/bonita.service";
import io from "socket.io-client";
import { SERVER_BACK_URL } from "../../config.ts";
import UploadFile from "./components/UploadFile";

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
  const [codigo, setCodigo] = useState(""); // Código del memorando
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

  // Obtener el usuario autenticado
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await obtenerUsuarioAutenticado();
      if (userData) {
        setUsuario(userData);
      }
    };
    fetchUser();
  }, [obtenerUsuarioAutenticado]);

  // Obtener datos de Bonita cuando ya se tenga el usuario
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

  // Emitir el evento socket para obtener el código de almacenamiento cuando se disponga de la data de Bonita
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

  // Función para subir el archivo del memorando y obtener el código mediante Socket.io
  const handleFileUpload = useCallback(async (file: File | null) => {
    if (!file) return;
    try {
      // Convertir el archivo a base64
      const memoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          const base64String = result.split(",")[1];
          resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
      });

      // Emitir el evento "subir_documento" a través del socket para obtener el código del memorando
      socket.emit("subir_documento", { documento: memoBase64 }, (response: any) => {
        if (response.success) {
          setCodigo(response.codigo);
        } else {
          console.error("Error al obtener el código del memorando:", response.message);
        }
      });
    } catch (err) {
      console.error("Error al procesar el archivo:", err);
    }
  }, []);

  // Función para avanzar, guardando el memorando
  const handleSiguiente = async () => {
    if (codigo.trim() !== "") {
      setCodigoGuardado(codigo);
      try {
        setCodigo("");
        await bonita.changeTask();
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

      {/* DocumentViewer para mostrar el documento */}
      <div className="w-full h-full md:w-3/4 pl-6 mt-0.5">
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

      {/* Sección para el código del memorando */}
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

        {/* Componente para subir el archivo del memorando */}
        <div className="mb-4">
          <label htmlFor="memoFile" className="block text-gray-700 font-medium mb-2">
            O suba el archivo del Memorando para obtener el código
          </label>
          <UploadFile
            id="memo-file"
            onFileChange={handleFileUpload}
            label="Subir archivo del Memorando"
          />
        </div>

        <button
          onClick={handleSiguiente}
          className="w-full bg-[#931D21] text-white py-2 rounded hover:bg-gray-400 transition duration-300"
        >
          Siguiente
        </button>
      </div>

      {/* Mostrar el código guardado si existe */}
      {codigoGuardado && (
        <p className="mt-4 text-black font-medium">Código guardado: {codigoGuardado}</p>
      )}

      {/* Mostrar mensaje de alerta */}
      {alertMessage && (
        <div className="mt-4 p-2 bg-yellow-200 text-black rounded">{alertMessage}</div>
      )}
    </div>
  );
}
