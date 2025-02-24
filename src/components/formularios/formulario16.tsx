import { useState, useEffect } from "react";
import CardContainer from "./components/CardContainer";
import Checkbox from "./components/Checkbox";
import UploadFile from "./components/UploadFile"; // Se importa el componente de carga
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import { useBonitaService } from "../../services/bonita.service";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import io from "socket.io-client";
import Title from "./components/TitleProps";
import { SERVER_BACK_URL } from "../../config.ts";

const socket = io(SERVER_BACK_URL);

export default function DocumentForm() {
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
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
  type BonitaData = {
    taskId: string;
    caseId: string;
    processId: string;
    processName: string;
  };
  type Usuario = {
    user_id: string;
    user_name: string;
  };
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [bonitaData, setBonitaData] = useState<BonitaData | null>(null);
  const bonita = new BonitaUtilities();
  const { obtenerUsuarioAutenticado, obtenerDatosBonita, error } = useBonitaService();
// @ts-ignore

  // Estados para manejo de carga y error en la subida del archivo
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await obtenerUsuarioAutenticado();
      if (userData) setUsuario(userData);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (bonitaData) {
      const id_registro = `${bonitaData.processId}-${bonitaData.caseId}`;
      const id_tarea = bonitaData.taskId;
      socket.emit(
        "obtener_estado_temporal",
        { id_registro, id_tarea },
        (response: { success: boolean; message: string; jsonData?: string }) => {
          if (response.success && response.jsonData) {
            try {
              const loadedState = JSON.parse(response.jsonData);
              setSelectedDocuments(loadedState);
            } catch (err) {
              console.error("Error al parsear el JSON:", err);
            }
          } else {
            console.error("Error al obtener el estado temporal:", response.message);
          }
        }
      );
    }
  }, [bonitaData]);

  useEffect(() => {
    if (!usuario) return;
    const fetchData = async () => {
      try {
        const data = await obtenerDatosBonita(usuario.user_id);
        if (data) setBonitaData(data);
      } catch (error) {
        console.error("❌ Error obteniendo datos de Bonita:", error);
      }
    };
    fetchData();
  }, [usuario]);

  useEffect(() => {
    if (bonitaData && usuario) {
      startAutoSave(
        {
          id_registro: `${bonitaData.processId}-${bonitaData.caseId}`,
          id_tarea: parseInt(bonitaData.taskId),
          jsonData: JSON.stringify(selectedDocuments),
          id_funcionario: parseInt(usuario.user_id),
        },
        10000,
        "En Proceso"
      );
    }
  }, [selectedDocuments, bonitaData, usuario, startAutoSave]);

  const handleMemoCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMemoCode(event.target.value);
  };

  // Función para subir el archivo del memorando y obtener el código
  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    try {
      setLoading(true);
      setUploadError("");
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
      // Llamar al backend para obtener el código del memorando
      const response = await fetch(`${SERVER_BACK_URL}/api/get-memo-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: memoBase64 }),
      });
      if (!response.ok) {
        throw new Error("Error al obtener el código del memorando");
      }
      const data = await response.json();
      if (data.memoCode) {
        setMemoCode(data.memoCode);
      }
    } catch (error) {
      console.error("Error al subir archivo del memorando:", error);
      setUploadError("Error al subir el archivo del memorando. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, checked: boolean) => {
    setSelectedDocuments((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Código del memorando:", memoCode);
    console.log("Documentos seleccionados:", selectedDocuments);
    const idtipoDocumento = 3;
    const response = await fetch(
      `${SERVER_BACK_URL}/api/save-memorando?key=${memoCode}&id_tipo_documento=${idtipoDocumento}&id_registro=${bonitaData?.processId}-${bonitaData?.caseId}`
    );
    if (!response.ok) {
      throw new Error("Error al guardar el memorando");
    }
    const data = await response.json();
    console.log("Memorando guardado:", data);
  };

  // Guardado final y avance en el proceso
  const handleNext = async () => {
    if (bonitaData && usuario) {
      try {
        await saveFinalState({
          id_registro: `${bonitaData.processId}-${bonitaData.caseId}`,
          id_tarea: parseInt(bonitaData.taskId),
          jsonData: JSON.stringify(selectedDocuments),
          id_funcionario: parseInt(usuario.user_id),
        });
        alert("Avanzando a la siguiente página...");
        bonita.changeTask();
      } catch (error) {
        console.error("Error guardando estado final:", error);
      }
    }
  };

  return (
    <CardContainer title="Expediente de Entrega">
      <Title text="Oficio de entrega y Expediente" className="text-center mb-1" />
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
        <button
          type="submit"
          className="w-full bg-[#931D21] hover:bg-[#7A171A] text-white py-2 rounded-lg font-semibold hover:scale-105 transition-transform duration-300"
          onClick={handleNext}
        >
          Siguiente
        </button>
        {usuario && (
          <p className="text-center text-gray-700 mt-2">
            Usuario autenticado: <b>{usuario.user_name}</b> (ID: {usuario.user_id})
          </p>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
    </CardContainer>
  );
}
