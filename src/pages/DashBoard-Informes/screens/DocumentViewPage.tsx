import  { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DocumentViewer from "../../../components/files/DocumentViewer";
import { SERVER_BACK_URL } from "../../../config";

const DocumentViewerPage = () => {
  const location = useLocation();
  const [documentInfo, setDocumentInfo] = useState({
    key: "",
    title: "",
    documentName: ""
  });

  useEffect(() => {
    // Obtener parámetros de la URL
    const params = new URLSearchParams(location.search);
    const key = params.get("key") || "";
    const title = params.get("title") || "Visor de Documento";
    const documentName = params.get("title") || key;

    setDocumentInfo({
      key,
      title,
      documentName
    });
  }, [location]);

  if (!documentInfo.key) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-lg">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Error al cargar documento</h1>
          <p className="text-gray-600">No se ha proporcionado un identificador válido para el documento.</p>
          <button 
            onClick={() => window.close()} 
            className="mt-4 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 transition-colors"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-red-800">{documentInfo.title}</h1>
          <button 
            onClick={() => window.close()} 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
        
        <DocumentViewer 
          keyDocument={documentInfo.key}
          title={documentInfo.title}
          documentName={documentInfo.documentName}
          mode="view"
          callbackUrl={`${SERVER_BACK_URL}/api/save-document`}
        />
      </div>
    </div>
  );
};

export default DocumentViewerPage;