import React from "react";

interface FileViewerProps {
  file: File;
}

const FileViewer: React.FC<FileViewerProps> = ({ file }) => {
  const fileType = file.type;

  // Función para mostrar el archivo dependiendo del tipo
  const renderFile = () => {
    if (fileType === "application/pdf") {
      return <embed src={URL.createObjectURL(file)} width="100%" height="500px" type="application/pdf" />;
    }
    if (fileType === "application/msword" || fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      return (
        <div>
          <p>Este es un archivo Word. (Puedes agregar un visor de Word aquí si lo deseas.)</p>
          <p>Para una visualización completa, considera convertirlo a PDF.</p>
        </div>
      );
    }
    return <p>Formato no soportado para vista previa.</p>;
  };

  return <div>{renderFile()}</div>;
};

export default FileViewer;
