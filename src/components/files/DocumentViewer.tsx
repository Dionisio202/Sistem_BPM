import React from 'react';
import { DocumentEditor } from '@onlyoffice/document-editor-react';
import { SERVER_BACK_URL, SERVER_ONLYOFFICE_URL } from "../../config.ts";
interface DocumentViewerProps {
  keyDocument: string;
  title: string;
  documentName: string; // Nombre del documento
  mode?: 'edit' | 'view'; // Modo de visualización
  callbackUrl?: string;   // Callback opcional
  fileType?: string;      // Tipo de archivo, ej. 'pdf', 'docx', etc.
  documentType?: string;  // Tipo de documento, ej. 'pdf', 'word', etc.
}

const onDocumentReady = (event: any) => {
  console.log('Documento cargado correctamente', event);
};

const onLoadComponentError = (errorCode: any, errorDescription: any) => {
  console.error('Error al cargar el componente:', errorDescription);
  switch (errorCode) {
    case -1:
      console.error('Error desconocido:', errorDescription);
      break;
    case -2:
      console.error('Error al cargar DocsAPI desde el servidor de documentos:', errorDescription);
      break;
    case -3:
      console.error('DocsAPI no está definido:', errorDescription);
      break;
    default:
      console.error(`Código de error no manejado (${errorCode}):`, errorDescription);
  }
};

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  keyDocument,
  title,
  documentName,
  mode,
  callbackUrl,
  fileType,
  documentType
})  => {
  const documentUrl = `${SERVER_BACK_URL}api/document?nombre=${encodeURIComponent(documentName)}`;
  const serverUrl = SERVER_ONLYOFFICE_URL;
  // Configuración de ONLYOFFICE con callbackUrl opcional
  const config: any = {
    document: {
      fileType: fileType || 'docx', // Valor por defecto 'pdf'
      key: keyDocument,
      title: title,
      url: documentUrl,
    },
    documentType: documentType || 'word', // Valor por defecto 'pdf'
    editorConfig: {
      mode: mode || 'view', // Modo de visualización, por defecto 'view'
      ...(callbackUrl && { callbackUrl })
    },
  };

  return (
    <div className="flex flex-col h-300 bg-gray-100 items-center justify-center p-6">
      <div className="w-full max-w-6xl border border-gray-300 shadow-md bg-white p-4 flex flex-col h-full">
        {/* Contenedor del Editor asegurando altura completa */}
        <div className="flex-grow w-full min-h-[1000px]">
          <div className="w-full h-full">
            <DocumentEditor
              id="docxEditor"
              documentServerUrl = {serverUrl}
              config={config} // Pasamos la configuración dinámica
              events_onDocumentReady={onDocumentReady}
              onLoadComponentError={onLoadComponentError}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
