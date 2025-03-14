import { useState, useEffect } from "react";
import CardContainer from "./components/CardContainer";
import Checkbox from "./components/Checkbox";
import UploadFile from "./components/UploadFile"; // Componente para cargar archivos
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import { useBonitaService } from "../../services/bonita.service";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import io from "socket.io-client";
import Title from "./components/TitleProps";
import { SERVER_BACK_URL } from "../../config.ts";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { useCombinedBonitaData } from "../bonita/hooks/obtener_datos_bonita.tsx";
import { ToastContainer, toast } from "react-toastify";
import Button from "../UI/button.tsx";
const socket = io(SERVER_BACK_URL);

export default function DocumentForm() {
  const [json, setJson] = useState<temporalData | null>(null);
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const { usuario, bonitaData, tareaActual } = useCombinedBonitaData();
  const { error } = useBonitaService();
  const [memoCode, setMemoCode] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState({
    solicitud: false,
    comprobantePago: false,
    curPago: false,
    contrato: false,
    accionPersonal: false,
    cedulaRepresentante: false,
    rucUTA: false,
  });
  const idtipoDocumento = 3;
  // @ts-ignore
  const bonita = new BonitaUtilities();
  const [loading, setLoading] = useState(false); // Estado para manejar el loading
    // @ts-ignore
  const [uploadError, setUploadError] = useState<string>("");
  const [_errror, setError] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false); // Estado para rastrear si el archivo se ha subido
  // @ts-ignore
  const [processAdvanced, setProcessAdvanced] = useState(false);

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
        nombre_tarea: tareaActual?.name ?? "",
      };
      setJson(data);
      startAutoSave(data, 10000, "En Proceso");
    }
  }, [bonitaData, usuario, startAutoSave, selectedDocuments, tareaActual]);

  const handleMemoCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMemoCode(event.target.value);
  };

  // Función para subir el archivo del memorando y obtener el código mediante Socket.io
  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      setError("Debes seleccionar un archivo para continuar.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setFileUploaded(false);
      setMemoCode("");

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

      // Emitir el evento "subir_documento" mediante Socket.io para obtener el código
      socket.emit(
        "subir_documento",
        { documento: memoBase64 },
        (response: any) => {
          if (
            response.success &&
            response.codigo &&
            !response.codigo.toLowerCase().includes("no encontrado") &&
            response.codigo.trim() !== ""
          ) {
            setMemoCode(response.codigo);
            setFileUploaded(true);
            toast.success("Archivo subido correctamente. Puede Continuar");
          } else {
            // Si la respuesta indica éxito pero el código tiene formato incorrecto
            if (
              response.success &&
              response.codigo &&
              (response.codigo.toLowerCase().includes("no encontrado") ||
                response.codigo.trim() === "")
            ) {
              setError(
                "El documento subido no es válido o no se puede procesar."
              );
              setMemoCode("");
              setFileUploaded(false);
              toast.error(
                "Documento inválido. Por favor, suba un documento válido."
              );
            } else {
              // Error general
              setError(
                response.message ||
                  "No se pudo obtener el código del memorando."
              );
              setMemoCode("");
              setFileUploaded(false);
              toast.error("Error al subir el archivo.");
            }
          }
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Error al obtener el código del memorando:");
      toast.error(
        "Error al obtener el código del memorando. Intente nuevamente."
      );
      setMemoCode("");
      setFileUploaded(false);
      toast.error("Error al procesar el archivo.");
      setLoading(false);
    }
  };

  const handleChange = (name: string, checked: boolean) => {
    setSelectedDocuments((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  // Función para guardar el memorando (submit del formulario)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Código del memorando:", memoCode);
    console.log("Documentos seleccionados:", selectedDocuments);

    await fetch(
      `${SERVER_BACK_URL}/api/save-memorando?key=${memoCode}&id_tipo_documento=${idtipoDocumento}&id_registro=${bonitaData?.processId}-${bonitaData?.caseId}&id_tarea_per=${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}`
    );

    toast.success("Memorando guardado correctamente.");
  };

  // Guardado final y avance en el proceso
  const handleNext = async () => {
    if (bonitaData && usuario) {
      if (!json) {
        toast.error("No hay datos para guardar.");
        return;
      }
      try {
        setLoading(true); // Activar el estado de loading
        const saveResponse = await saveFinalState(json);
        // Verificar que la respuesta sea válida y exitosa
        if (!saveResponse || typeof saveResponse.success !== "boolean") {
          throw new Error("Respuesta inválida al guardar el estado final.");
        }
        if (!saveResponse.success) {
          throw new Error(
            saveResponse.message ||
              "No se pudo guardar el estado final. Inténtelo de nuevo."
          );
        }

        await bonita.changeTask();
        setProcessAdvanced(true);
      } catch (error) {
        console.error("Error guardando estado final:", error);
      } finally {
        setLoading(false); // Desactivar el estado de loading
      }
    }
  };

  // Condición para habilitar ambos botones (ajústala según la lógica deseada)
  const isDisabled =
    loading ||
    (memoCode.trim() === "" && !fileUploaded) ||
    !Object.values(selectedDocuments).every((value) => value === true);

  return (
    <CardContainer title="Expediente de Entrega">
      <Title
        text="Oficio de entrega y Expediente"
        className="text-center mb-1"
      />
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {/* Componente para subir el archivo del memorando */}
        <div className="flex flex-col">
          <label htmlFor="memoFile" className="block font-semibold">
            Suba el archivo del Memorando para obtener el código
          </label>
          <UploadFile
            id="memo-file"
            onFileChange={handleFileUpload}
            label="Subir archivo del Memorando"
          />
          {uploadError && <p className="text-red-500">{uploadError}</p>}
        </div>

        {/* Input para el código del memorando */}
        <div className="flex flex-col">
          <label htmlFor="memoCode" className="block font-semibold">
            Código de Oficio realizado para entrega de ejemplares
          </label>
          <input
            id="memoCode"
            type="text"
            className="border p-1 rounded mt-1"
            value={memoCode}
            onChange={handleMemoCodeChange}
          />
        </div>

        {/* Checkboxes para los documentos */}
        <div className="space-y-2 text-xn">
          <Checkbox
            label="Solicitud"
            value={selectedDocuments.solicitud}
            onChange={(checked) => handleChange("solicitud", checked)}
          />
          <Checkbox
            label="Comprobante de Pago"
            value={selectedDocuments.comprobantePago}
            onChange={(checked) => handleChange("comprobantePago", checked)}
          />
          <Checkbox
            label="CUR de Pago"
            value={selectedDocuments.curPago}
            onChange={(checked) => handleChange("curPago", checked)}
          />
          <Checkbox
            label="Contrato de Cesión de Derechos"
            value={selectedDocuments.contrato}
            onChange={(checked) => handleChange("contrato", checked)}
          />
          <Checkbox
            label="Acción de Personal de Representante Legal"
            value={selectedDocuments.accionPersonal}
            onChange={(checked) => handleChange("accionPersonal", checked)}
          />
          <Checkbox
            label="Copia de Cédula de Representante Legal"
            value={selectedDocuments.cedulaRepresentante}
            onChange={(checked) => handleChange("cedulaRepresentante", checked)}
          />
          <Checkbox
            label="RUC UTA"
            value={selectedDocuments.rucUTA}
            onChange={(checked) => handleChange("rucUTA", checked)}
          />
        </div>

        {/* Botones separados para cada acción */}
        <div className="flex flex-row gap-4">
          <Button
            className="w-full bg-[#931D21] hover:bg-[#7A171A] text-white py-2 rounded-lg font-semibold hover:scale-105 transition-transform duration-300 disabled:opacity-50"
            onClick={handleNext}
            disabled={loading || isDisabled} // Deshabilitar si no se ha subido el archivo
          >
            {loading ? "Cargando..." : "Siguiente Proceso"}
          </Button>
        </div>

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
