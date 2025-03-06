import React, { useState } from "react";
import { UploadFileProps } from "../../../interfaces/uploadfile.interface";
import {toast} from "react-toastify"; 
const UploadFile: React.FC<UploadFileProps> = ({
  onFileChange,
  label = "Subir archivo",
  id,
}) => {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (selectedFile) {
      // Validar que el archivo sea PDF
      if (selectedFile.type !== "application/pdf") {
        toast.error("Solo se permiten archivos PDF.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setFileName("");
        onFileChange(null);
        return;
      }

      setFileName(selectedFile.name);
      onFileChange(selectedFile);
    } else {
      setFileName("");
      onFileChange(null);
    }
  };

  return (
    <div className="mb-4">
      <label
        htmlFor={id} // Usamos el id único aquí
        className="block font-semibold text-gray-700 text-sm"
      >
        {label} {/* Usamos el prop label aquí */}
      </label>
      <div className="relative mt-2">
        <input
          id={id} // Asegúrate de que el id coincida con el htmlFor
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf"
        />
        <label
          htmlFor={id} // El mismo id para la etiqueta y el input
          className="bg-neutral-300 flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-gray-500 transition"
        >
          <span className="text-gray-600">
            {fileName || "Seleccionar archivo..."}
          </span>
        </label>
      </div>
      {fileName && (
        <p className="mt-2 text-sm text-gray-500">
          Archivo seleccionado: <span className="font-medium">{fileName}</span>
        </p>
      )}
    </div>
  );
};

export default UploadFile;
