import { useState, useEffect, ChangeEvent } from "react";
import CardContainer from "./components/CardContainer";
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import Title from "./components/TitleProps";
import io from "socket.io-client";
import { useBonitaService } from "../../services/bonita.service";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { Tarea } from "../../interfaces/bonita.interface.ts";
import { SERVER_BACK_URL } from "../../config.ts";
import { temporalData } from "../../interfaces/actividad.interface.ts";
const socket = io(SERVER_BACK_URL);

export default function ConfirmationScreen() {
  const [tareaActual, setTareaActual] = useState<Tarea | null>(null);
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const [selectedDocuments, setSelectedDocuments] = useState({
    contrato: false,
    acta: false,
  });
  const [json, setJson] = useState<temporalData | null>(null);
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
  const {
    obtenerUsuarioAutenticado,
    obtenerDatosBonita,
    error,
    obtenerTareaActual,
  } = useBonitaService();

  // 🔹 Manejo de cambios en los checkboxes
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSelectedDocuments((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  // 🔹 Obtener el usuario autenticado al montar el componente
  // 🔹 Obtener el usuario autenticado al montar el componente
    useEffect(() => {
      const fetchUser = async () => {
        const userData = await obtenerUsuarioAutenticado();
        if (userData) {
          setUsuario(userData);
        }
      };
      fetchUser();
    }, [obtenerUsuarioAutenticado]);
  
    // 🔹 Obtener datos de Bonita una vez que se tenga el usuario
    useEffect(() => {
      if (!usuario) return;
      const fetchData = async () => {
        try {
          const tareaData = await obtenerTareaActual(usuario.user_id);
          setTareaActual(tareaData);
          const data = await obtenerDatosBonita(usuario.user_id);
          if (data) {
            setBonitaData(data);
          }
        } catch (error) {
          console.error("❌ Error obteniendo datos de Bonita:", error);
        }
      };
      fetchData();
    }, [usuario, obtenerDatosBonita]);
  
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
    
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("📌 Documentos confirmados:", selectedDocuments);
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
        await bonita.changeTask();
        alert("Avanzando a la siguiente página...");
      } catch (error) {
        console.error("Error guardando estado final:", error);
      }
    }
  };

  return (
    <CardContainer title="Contrato de Cesión de Derechos">
      <Title
        text="Firma y Emisión de documento firmado"
        className="text-center text-gray-800 mb-3 text-lg"
      />
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="contrato"
              checked={selectedDocuments.contrato}
              onChange={handleChange}
              id="contrato"
              className="mr-2"
            />
            <label htmlFor="contrato" className="font-semibold">
              Contrato de Cesión de Derechos de Patrimoniales
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="acta"
              checked={selectedDocuments.acta}
              onChange={handleChange}
              id="acta"
              className="mr-2"
            />
            <label htmlFor="acta" className="font-semibold">
              Acta de Participación
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#931D21] hover:bg-[#7A171A] text-white py-2 rounded-lg font-semibold hover:scale-105 transition-transform duration-300"
          onClick={handleNext}
        >
          Siguiente Proceso
        </button>

        {usuario && (
          <p className="text-center text-gray-700 mt-2">
            Usuario autenticado: <b>{usuario.user_name}</b> (ID:{" "}
            {usuario.user_id})
          </p>
        )}

        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
    </CardContainer>
  );
}
