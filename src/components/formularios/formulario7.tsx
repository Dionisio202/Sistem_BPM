import { useState, useEffect } from "react";
import CardContainer from "./components/CardContainer";
import UploadFile from "./components/UploadFile"; // Componente para cargar archivos
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import Checkbox from "./components/Checkbox";
import Title from "./components/TitleProps";
import io from "socket.io-client";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { SERVER_BACK_URL } from "../../config.ts";
import { useCombinedBonitaData } from "../bonita/hooks/obtener_datos_bonita.tsx";
import { useBonitaService } from "../../services/bonita.service.ts";
import { ToastContainer, toast } from "react-toastify";
import Button from "../UI/button.tsx";
const socket = io(SERVER_BACK_URL);

export default function ConfirmationScreen() {
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const { usuario, bonitaData, tareaActual } = useCombinedBonitaData();
  const { error } = useBonitaService();
  const [selectedDocuments, setSelectedDocuments] = useState({
    contrato: false,
    acta: false,
  });
  const [json, setJson] = useState<temporalData | null>(null);
  const [contratoFile, setContratoFile] = useState<File | null>(null);
  const [actaFile, setActaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const bonita: BonitaUtilities = new BonitaUtilities();
  const [processAdvanced, setProcessAdvanced] = useState(false);

  const handleChange = (name: string, checked: boolean) => {
    setSelectedDocuments((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  // 🔹 Recuperar el estado guardado al cargar el componente
  useEffect(() => {
    if (bonitaData) {
      const id_registro = `${bonitaData.processId}-${bonitaData.caseId}`;
      const id_tarea = bonitaData.taskId;

      socket.emit(
        "obtener_estado_temporal",
        { id_registro, id_tarea },
        (response: {
          success: boolean;
          message: string;
          jsonData?: string;
        }) => {
          if (response.success && response.jsonData) {
            console.log("📦 Estado temporal cargado:", response.jsonData);
            try {
              const loadedState = JSON.parse(response.jsonData);
              setSelectedDocuments(loadedState);
            } catch (err) {
              console.error("Error al parsear el JSON:", err);
            }
          } else {
            console.error(
              "Error al obtener el estado temporal:",
              response.message
            );
          }
        }
      );
    }
  }, [bonitaData]);

  useEffect(() => {
    if (bonitaData && usuario) {
      const data: temporalData = {
        id_registro: `${bonitaData.processId}-${bonitaData.caseId}`,
        id_tarea: parseInt(bonitaData.taskId),
        jsonData: JSON.stringify(selectedDocuments),
        id_funcionario: parseInt(usuario.user_id),
        nombre_tarea: tareaActual?.name || "",
      };
      setJson(data);
      startAutoSave(data, 10000, "En Proceso");
    }
  }, [bonitaData, usuario, startAutoSave, selectedDocuments, tareaActual]);

  // Función para subir un archivo firmado usando el endpoint "get-document"
  const uploadSignedDocument = async (
    file: File,
    documentType: "contrato" | "acta"
  ) => {
    if (!bonitaData) return;
    // Convertir el archivo a base64
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });

    // Extraer el nombre base del archivo
    const fileName = file.name;
    const dotIndex = fileName.lastIndexOf(".");
    const baseName =
      dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName;

    const payload = {
      nombre:
        baseName +
        `_${bonitaData.processId}-${bonitaData.caseId}-${bonitaData.taskId}`,
      id_registro_per: `${bonitaData.processId}-${bonitaData.caseId}`,
      id_tipo_documento: documentType === "contrato" ? "4" : "5", // Asigna IDs según la lógica de tu negocio
      document: fileBase64,
      memorando: "", // No se requiere para archivos firmados
      id_tarea_per: `${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}`,
    };

    try {
      const response = await fetch(`${SERVER_BACK_URL}/api/get-document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Respuesta del servidor para ${documentType}:`, data);
    } catch (error) {
      console.error(
        `Error al subir archivo firmado de ${documentType}:`,
        error
      );
      toast.error(
        `Ocurrió un error al subir el archivo firmado de ${documentType}.`
      );
    }
  };

  // 🔹 Guardado final y subida de archivos firmados al hacer clic en "Siguiente"
  const handleNext = async () => {
    // Validar que todos los checkbox estén seleccionados
    if (!selectedDocuments.contrato || !selectedDocuments.acta) {
      toast.error("Debes seleccionar todos los documentos para continuar.");
      return;
    }

    // Validar que los archivos correspondientes se hayan subido
    if (selectedDocuments.contrato && !contratoFile) {
      toast.error("Debes subir el archivo firmado del Contrato.");
      return;
    }
    if (selectedDocuments.acta && !actaFile) {
      toast.error("Debes subir el archivo firmado del Acta.");
      return;
    }

    if (bonitaData && usuario) {
      try {
        setLoading(true);

        // Guardado final del estado temporal
        if (json) {
          await saveFinalState(json);
        } else {
          console.error("❌ Error: json is null");
        }

        // Subir el archivo firmado de contrato si está seleccionado y cargado
        let contratoUploadSuccess = true;
        if (selectedDocuments.contrato && contratoFile) {
          try {
            await uploadSignedDocument(contratoFile, "contrato");
          } catch (error) {
            console.error("Error al subir el archivo del Contrato:", error);
            toast.error("Error al subir el archivo del Contrato.");
            contratoUploadSuccess = false;
          }
        }
        // Subir el archivo firmado de acta si está seleccionado y cargado
        let actaUploadSuccess = true;
        if (selectedDocuments.acta && actaFile) {
          try {
            await uploadSignedDocument(actaFile, "acta");
          } catch (error) {
            console.error("Error al subir el archivo del Acta:", error);
            toast.error("Error al subir el archivo del Acta.");
            actaUploadSuccess = false;
          }
        }

        // Verificar si ambos archivos se subieron correctamente
        if (contratoUploadSuccess && actaUploadSuccess) {
          await bonita.changeTask();
          setProcessAdvanced(true);
          // Cambiar de tarea solo si no hubo errores
        } else {
          toast.error(
            "No se pudo completar la subida de archivos. Verifica los errores."
          );
        }
      } catch (error) {
        console.error(
          "Error guardando estado final o subiendo archivos:",
          error
        );
        toast.error("Ocurrió un error al procesar la solicitud.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Manejador de submit (puedes usarlo para guardar el estado sin cambiar de tarea)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Evita que el formulario se envíe y recargue la página
    console.log("📌 Documentos confirmados:", selectedDocuments);
  };

  return (
    <CardContainer title="Confirmación de Firma">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <Title
          text="Contrato de Cesión de Derechos y Acta de Participación"
          className="text-center text-gray-800 mb-3 text-xs"
        />
        <div className="space-y-3">
          <Checkbox
            label="Contrato de Cesión de Derechos Patrimoniales"
            value={selectedDocuments.contrato}
            onChange={(checked) => handleChange("contrato", checked)}
          />
          <Checkbox
            label="Acta de Participación"
            value={selectedDocuments.acta}
            onChange={(checked) => handleChange("acta", checked)}
          />
        </div>

        {/* Componentes para subir los archivos firmados */}
        <div className="mb-4">
          <UploadFile
            id="contrato-file"
            onFileChange={(file) => setContratoFile(file)}
            label="Subir archivo firmado del Contrato"
          />
        </div>
        <div className="mb-4">
          <UploadFile
            id="acta-file"
            onFileChange={(file) => setActaFile(file)}
            label="Subir archivo firmado del Acta"
          />
        </div>

        <Button
          className="w-full bg-[#931D21] hover:bg-[#7A171A] text-white py-2 rounded-lg font-semibold hover:scale-105 transition-transform duration-300"
          onClick={handleNext}
          disabled={
            loading ||
            !selectedDocuments.contrato ||
            !selectedDocuments.acta ||
            !contratoFile ||
            !actaFile
          }
        >
          {loading ? "Cargando..." : "Siguiente"}
        </Button>
        {usuario && (
          <p className="text-center text-gray-700 mt-2">
            Usuario autenticado: <b>{usuario.user_name}</b> (ID:{" "}
            {usuario.user_id})
          </p>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
      <ToastContainer />
    </CardContainer>
  );
}
