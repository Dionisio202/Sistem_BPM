import { useState, useEffect } from "react";
import CardContainer from "./components/CardContainer";
import Checkbox from "./components/Checkbox"; // Importamos el componente Checkbox
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";

import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { SERVER_BACK_URL } from "../../config.ts";
import { useBonitaService } from "../../services/bonita.service";
import { Tarea } from "../../interfaces/bonita.interface.ts";
import io from "socket.io-client";
import Title from "./components/TitleProps";
const socket = io(SERVER_BACK_URL);

export default function ConfirmationScreen() {
  const [json, setJson] = useState<temporalData | null>(null);
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const [tareaActual, setTareaActual] = useState<Tarea | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState({
    certificado: false,
  });

  const [usuario, setUsuario] = useState<{
    user_id: string;
    user_name: string;
  } | null>(null);
  const [bonitaData, setBonitaData] = useState<{
    processId: string;
    taskId: string;
    caseId: string;
    processName: string;
  } | null>(null);

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

  // 🔹 Obtener el usuario autenticado al montar el componente
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await obtenerUsuarioAutenticado();
        if (userData) setUsuario(userData);
        if (usuario) {
          const tareaData = await obtenerTareaActual(usuario.user_id);
          setTareaActual(tareaData);
        }
      } catch (error) {
        console.error("❌ Error obteniendo usuario autenticado:", error);
      }
    };
    fetchUser();
  }, [obtenerUsuarioAutenticado]);
  useEffect(() => {
    if (bonitaData) {
      const id_registro = `${bonitaData.processId}-${bonitaData.caseId}`;
      const id_tarea = bonitaData.taskId; // o parsearlo si es necesario

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
  // 🔹 Obtener datos de Bonita una vez que se tenga el usuario
  useEffect(() => {
    if (!usuario) return;

    const fetchData = async () => {
      try {
        const data = await obtenerDatosBonita(usuario.user_id);
        if (data) {
          setBonitaData(data);
        }
      } catch (error) {
        console.error("❌ Error obteniendo datos de Bonita:", error);
      }
    };

    fetchData();
  }, [usuario]);

  // 🔹 Iniciar el guardado automático ("En Proceso")
  useEffect(() => {
    if (bonitaData && usuario) {
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
    <CardContainer title="Certificado/Título de Registro">
      <Title text="Autorización de Entrega" className="text-center mb-6" />
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <p className="text-lg">Confirmación de entrega de certificado:</p>

        {/* Sección de checkbox */}
        <div className="space-y-3">
          <Checkbox
            label="Entrega de Certificado de Título de Registro"
            value={selectedDocuments.certificado}
            onChange={(checked) => handleChange("certificado", checked)}
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
    </CardContainer>
  );
}
