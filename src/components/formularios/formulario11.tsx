import React, { useState, useEffect } from "react";
import CardContainer from "./components/CardContainer";
import io from "socket.io-client";
import UploadFile from "./components/UploadFile";
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import Button from "../UI/button";
import Title from "./components/TitleProps";
import { SERVER_BACK_URL } from "../../config.ts";
import { useBonitaService } from "../../services/bonita.service";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { Tarea } from "../../interfaces/bonita.interface.ts";
const socket = io(SERVER_BACK_URL);
const Formulario11: React.FC = () => {
  const [tareaActual, setTareaActual] = useState<Tarea | null>(null);
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const { obtenerDatosBonita, obtenerUsuarioAutenticado, obtenerTareaActual } =
    useBonitaService();
  const [file, setFile] = useState<File | null>(null);
  const bonita: BonitaUtilities = new BonitaUtilities();
  const [notificaciones, setNotificaciones] = useState<string[]>([]);
  const [json, setJson] = useState<temporalData | null>(null);

  // @ts-ignore
  const [isSubmitted, setIsSubmitted] = useState(false); // Nuevo estado para controlar el envío

  // Obtener datos del formulario
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
 // Obtener usuario autenticado
 useEffect(() => {
  const fetchUser = async () => {
    try {
      const userData = await obtenerUsuarioAutenticado();
      if (userData) setUsuario(userData);
    } catch (error) {
      console.error("❌ Error obteniendo usuario autenticado:", error);
    }
  };
  fetchUser();
}, [obtenerUsuarioAutenticado]);

// Obtener datos de Bonita cuando el usuario ya esté disponible
useEffect(() => {
  if (!usuario) return;
  const fetchTareaData = async () => {
    const tareaData = await obtenerTareaActual(usuario.user_id);
    setTareaActual(tareaData);
  };
  fetchTareaData();
  const fetchData = async () => {
    try {
      const data = await obtenerDatosBonita(usuario.user_id);
      if (data) setBonitaData(data);
    } catch (error) {
      console.error("❌ Error obteniendo datos de Bonita:", error);
    }
  };
  fetchData();
}, [usuario, obtenerDatosBonita]);
useEffect(() => {
  if (bonitaData && usuario) {
    const data: temporalData = {
      id_registro: `${bonitaData.processId}-${bonitaData.caseId}`,
      id_tarea: parseInt(bonitaData.taskId),
      jsonData: JSON.stringify("No Form Data"),
      id_funcionario: parseInt(usuario.user_id),
      nombre_tarea: tareaActual?.name || "",
    };
    setJson(data);
    startAutoSave(data, 10000, "En Proceso");
  }
}, [bonitaData, usuario, startAutoSave]);

  const handleNext = async () => {
    try {
      if (json) {
        await saveFinalState(json);
      } else {
        console.error("❌ Error: json is null");
      }
      await bonita.changeTask();
      alert("Avanzando a la siguiente página...");
    } catch (error) {
      console.error("Error al cambiar la tarea:", error);
      alert("Ocurrió un error al intentar avanzar.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      alert("Por favor, cargue un archivo.");
      return;
    }

    const fileName = file.name;
    const dotIndex = fileName.lastIndexOf(".");
    const baseName =
      dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName;

    const fileBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });

    const payload = {
      nombre:
        baseName +
        `_${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}`,
      id_registro_per: `${bonitaData?.processId}-${bonitaData?.caseId}`, // Ajusta según tu lógica
      id_tipo_documento: "6",
      document: fileBase64,
    };

    try {
      const response = await fetch(`${SERVER_BACK_URL}/api/get-document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Respuesta del servidor:", data);
      setIsSubmitted(true);
      setNotificaciones([...notificaciones, "Datos enviados correctamente."]);
      alert("Datos enviados correctamente."); // Mensaje de confirmación
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  return (
    <CardContainer title="Registro de Propiedad Intelectual">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-6 rounded-lg shadow-lg"
      >
        <Title
          text="Comprobante de Pago Senadi"
          size="2xl"
          className="text-center mb-1"
        />

        <UploadFile
          id="document-file"
          onFileChange={setFile}
          label="Subir comprobante de pago  de la solucitud del registro de la propiedad intelectual"
        />

        <Button
          type="submit"
          className="mt-5 w-full bg-blue-600 text-white px-6 rounded hover:bg-blue-700"
        >
          Enviar Datos
        </Button>

        <Button
          className="mt-5 bg-[#931D21] text-white rounded-lg px-6 min-w-full hover:bg-blue-700"
          onClick={handleNext}
        >
          Siguiente Proceso
        </Button>
      </form>
      <div className="mt-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold">Notificaciones</h2>
        <ul className="bg-white p-4 rounded-lg shadow">
          {notificaciones.length === 0 ? (
            <li className="text-gray-500">No hay notificaciones aún.</li>
          ) : (
            notificaciones.map((noti, index) => (
              <li key={index} className="text-green-600">
                {noti}
              </li>
            ))
          )}
        </ul>
      </div>
    </CardContainer>
  );
};

export default Formulario11;
