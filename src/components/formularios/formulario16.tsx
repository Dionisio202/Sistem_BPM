import { useState, useEffect } from "react";
import CardContainer from "./components/CardContainer";
import Checkbox from "./components/Checkbox";
import UploadFile from "./components/UploadFile";
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
const socket = io(SERVER_BACK_URL,{
  path: "/doc/socket.io",
  transports: ['websocket'],
  secure: true,
  rejectUnauthorized: false 
});

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
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hasSaved, setHasSaved] = useState(false); // Nuevo estado para controlar el guardado
  // @ts-ignore
  const [uploadError, setUploadError] = useState<string>("");
  const [_errror, setError] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);

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

  // Resetear estado de guardado cuando cambia el código
  useEffect(() => {
    setHasSaved(false);
  }, [memoCode]);

  const handleMemoCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMemoCode(event.target.value);
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      setError("Debes seleccionar un archivo para continuar.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setFileUploaded(false);
      setMemoCode("");

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
              setError(
                response.message ||
                  "No se pudo obtener el código del memorando."
              );
              setMemoCode("");
              setFileUploaded(false);
              toast.error("Error al subir el archivo.");
            }
          }
          setSaving(false);
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
      setSaving(false);
    }
  };

  const handleChange = (name: string, checked: boolean) => {
    setSelectedDocuments((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setHasSaved(true);
    try {
      await fetch(
        `${SERVER_BACK_URL}/doc/api/save-memorando?key=${memoCode}&id_tipo_documento=${idtipoDocumento}&id_registro=${bonitaData?.processId}-${bonitaData?.caseId}&id_tarea_per=${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}`
      );
      toast.success("Memorando guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar el memorando:", error);
      toast.error("Error al guardar el memorando. Intente nuevamente.");
    } finally {
      setSaving(false);
      setHasSaved(true); // Marcar que se intentó guardar
    }
  };

  const handleNext = async () => {
    if (bonitaData && usuario) {
      if (!json) {
        toast.error("No hay datos para guardar.");
        return;
      }
      try {
        setProcessing(true);
        const saveResponse = await saveFinalState(json);
        
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
      } catch (error) {
        console.error("Error guardando estado final:", error);
      } finally {
        setProcessing(false);
      }
    }
  };

  const isSaveDisabled = 
    saving || 
    processing ||
    (memoCode.trim() === "" && !fileUploaded) ||
    !Object.values(selectedDocuments).every(Boolean);

  return (
    <CardContainer title="Expediente de Entrega">
      <Title
        text="Oficio de entrega y Expediente"
        className="text-center mb-1"
      />
      <div className="flex flex-col space-y-4">
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

        <div className="flex flex-row gap-4">
          <Button
            type="button"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold hover:scale-105 transition-transform duration-300 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSaveDisabled}
          >
            {"Guardar Memorando"}
          </Button>
          <Button
            type="button"
            className="w-full bg-[#931D21] hover:bg-[#7A171A] text-white py-2 rounded-lg font-semibold hover:scale-105 transition-transform duration-300 disabled:opacity-50"
            onClick={handleNext}
            disabled={!hasSaved || processing} // Control modificado aquí
          >
            {processing ? "Procesando..." : "Siguiente Proceso"}
          </Button>
        </div>

        {usuario && (
          <p className="text-center text-gray-700 mt-2">
            Usuario autenticado: <b>{usuario.user_name}</b> (ID:{" "}
            {usuario.user_id})
          </p>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
      <ToastContainer />
    </CardContainer>
  );
}