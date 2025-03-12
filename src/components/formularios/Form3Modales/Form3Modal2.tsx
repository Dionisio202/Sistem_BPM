import React, { useState } from "react";
import UploadFile from "../components/UploadFile";
import { ModalProps } from "../../../interfaces/registros.interface";
import Title from "../components/TitleProps";
import { ToastContainer, toast } from "react-toastify";

const Form3Modal2: React.FC<ModalProps> = ({
  showModal,
  closeModal,
  modalData,
  onSave,
  tipoMemorando,
  handleTipoMemorandoChange,
}) => {
  const [hasMissingData, setHasMissingData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [intellectualPropertyFileBase64, setIntellectualPropertyFileBase64] = useState<string | null>(null);
  const [authorDataFileBase64, setAuthorDataFileBase64] = useState<string | null>(null);

  // Función para manejar cambios en los archivos
  const handleFileChange = (file: File | null, fileType: string) => {
    if (file) {
      convertFileToBase64(file).then((base64) => {
        if (fileType === "Solicitud de Registro de Propiedad Intelectual") {
          setIntellectualPropertyFileBase64(base64);
        } else {
          setAuthorDataFileBase64(base64);
        }
      }).catch((error) => {
        toast.error(`Error al convertir el archivo: ${error}`);
      });
    }
  };

  // Función para convertir un archivo a base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const base64 = reader.result.split(",")[1];
          if (base64) resolve(base64);
          else reject("No se pudo extraer la parte base64 del archivo.");
        } else {
          reject("Error al procesar el archivo.");
        }
      };
      reader.onerror = () => reject("Error al leer el archivo.");
      reader.readAsDataURL(file);
    });
  };

  // Función para guardar los datos
  const handleSave = async () => {
    if (!intellectualPropertyFileBase64 || !authorDataFileBase64) {
      setHasMissingData(true);
      toast.warning("Por favor, sube ambos archivos antes de guardar.");
      return;
    }

    setLoading(true);
    try {
      // Aquí puedes agregar la lógica para enviar los archivos al backend
      // Por ejemplo:
      // const response = await enviarArchivosAlBackend(intellectualPropertyFileBase64, authorDataFileBase64);
      // if (response.success) {
      //   toast.success("Archivos guardados correctamente.");
      // } else {
      //   toast.error("Error al guardar los archivos.");
      // }

      // Simulación de éxito
      toast.success("Archivos guardados correctamente.");
      setHasMissingData(false);
      closeModal();
    } catch (error) {
      toast.error(`Error al guardar los archivos: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-1 bg-gradient-to-r to-gray-100 min-h-screen">
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-xl border border-gray-700">
        <Title
          text="Atención de Solicitud de Registro de Propiedad Intelectual"
          size="2xl"
          className="text-center text-gray-800 mb-3 text-lg"
        />
        <h1 className="text-sm font-bold text-center text-gray-900 mb-9">
          Revisión y Análisis de Requerimiento
        </h1>
        <UploadFile
          id="author-data-file"
          onFileChange={(file) =>
            handleFileChange(file, "Datos informativos de autores")
          }
          label="Cargar Datos informativos de autores"
        />

        {/* Botones */}
        <div className="flex justify-end p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white text-xs px-4 py-2 rounded-lg hover:bg-gray-600 mr-2"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-[#931D21] text-white text-xs px-4 py-2 rounded-lg hover:bg-red-700"
            disabled={hasMissingData || loading}
          >
            {loading ? "Procesando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Form3Modal2;