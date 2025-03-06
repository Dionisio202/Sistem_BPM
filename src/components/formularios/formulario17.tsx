import { useState, useEffect } from "react";
import CardContainer from "./components/CardContainer";
import Checkbox from "./components/Checkbox"; // Importamos el componente Checkbox
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { useBonitaService } from "../../services/bonita.service";
import io from "socket.io-client";
import Title from "./components/TitleProps";
import { SERVER_BACK_URL } from "../../config.ts";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { useCombinedBonitaData } from "../bonita/hooks/obtener_datos_bonita.tsx";
import { ToastContainer } from "react-toastify"; 
const socket = io(SERVER_BACK_URL);

export default function ConfirmationScreen() {
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const { usuario, bonitaData, tareaActual} = useCombinedBonitaData();
  const [selectedDocuments, setSelectedDocuments] = useState({
    oficio: false,
  });
  const [json, setJson] = useState<temporalData | null>(null);
  const bonita: BonitaUtilities = new BonitaUtilities();
  // @ts-ignore
  const {
    obtenerUsuarioAutenticado,
    obtenerDatosBonita,
    obtenerTareaActual,
  } = useBonitaService();

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

  // 🔹 Iniciar el guardado automático ("En Proceso")
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Documentos confirmados:", selectedDocuments);
  };

  // 🔹 Guardado final al hacer clic en "Siguiente"
  const handleNext = async () => {
    if (bonitaData && usuario) {
      try {
        if (json) {
          await saveFinalState(json);
        } else {
          console.error("❌ Error: json is null");
        }
        alert("Avanzando a la siguiente página...");
        bonita.changeTask();
      } catch (error) {
        console.error("Error guardando estado final:", error);
      }
    }
  };

  return (
    <CardContainer title="Oficio para Entrega de Ejemplares">
      <Title
        text="Firma de oficio para entrega de documentación"
        className="text-center mb-6"
      />
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <p className="text-lg">Confirmación de firma de oficio:</p>

        {/* Sección de checkboxes */}
        <div className="space-y-3">
          <Checkbox
            label="Oficio Firmado?"
            value={selectedDocuments.oficio}
            onChange={(checked) => handleChange("oficio", checked)} // Corregido el nombre aquí
          />
        </div>

        {/* Botón Siguiente */}
        <button
          type="submit"
          className="w-full bg-[#931D21] hover:bg-[#7A171A] text-white py-2 rounded-lg font-semibold hover:scale-105 transition-transform duration-300"
          onClick={handleNext}
        >
          Siguiente
        </button>
      </form>
      <ToastContainer/>
    </CardContainer>
  );
}
