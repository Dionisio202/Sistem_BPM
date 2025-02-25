import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import UploadFile from "./components/UploadFile"; // Componente para cargar archivos
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import Title from "./components/TitleProps";
import Button from "../UI/button";
import { SERVER_BACK_URL } from "../../config.ts";
import { useBonitaService } from "../../services/bonita.service";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
import { temporalData } from "../../interfaces/actividad.interface.ts";

// Crear instancia de socket
const socket = io(SERVER_BACK_URL);

export default function UploadForm() {
    const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const { obtenerUsuarioAutenticado, obtenerDatosBonita } = useBonitaService();
  const [memoCode, setMemoCode] = useState("");
  const [notificaciones, setNotificaciones] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [usuario, setUsuario] = useState<{ user_id: string; user_name: string } | null>(null);
  const [bonitaData, setBonitaData] = useState<{
    processId: string;
    taskId: string;
    caseId: string;
    processName: string;
  } | null>(null);
  const [json, setJson] = useState<temporalData | null>(null);
  // Estado para controlar el envío
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Estado para guardar la última certificación presupuestaria
  const [lastCertification, setLastCertification] = useState<{ fecha_doc: string; yaPasoUnAño: boolean } | null>(null);
  // Permite forzar la subida de un nuevo documento aun cuando ya exista uno previo
  const [forceNewUpload, setForceNewUpload] = useState(false);

  const bonita = new BonitaUtilities();

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
      };
      setJson(data);
      startAutoSave(data, 10000, "En Proceso");
    }
  }, [bonitaData, usuario, startAutoSave]);

  // Obtener la última certificación presupuestaria usando el endpoint /last-document
  useEffect(() => {
    const fetchLastDocument = async () => {
      try {
        const response = await fetch(`${SERVER_BACK_URL}/api/last-document?id_tipo_documento=5`);
        if (response.ok) {
          const data = await response.json();
          setLastCertification(data);
        } else {
          console.error("Error al obtener el último documento");
        }
      } catch (error) {
        console.error("Error en fetchLastDocument", error);
      }
    };

    fetchLastDocument();
  }, [isSubmitted]);

  // Función para calcular el tiempo restante hasta cumplir un año
  const calculateRemainingTime = (fecha_doc: string) => {
    const fechaDocumento = new Date(fecha_doc);
    const fechaActual = new Date();
    const unAñoMs = 365 * 24 * 60 * 60 * 1000;
    const diffMs = fechaActual.getTime() - fechaDocumento.getTime();
    const remainingMs = unAñoMs - diffMs;
    if (remainingMs <= 0) return "0 días";
    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} días y ${hours} horas`;
  };

  // Manejar el cambio del archivo del memorando usando Socket.io
  const handleMemoFileChange = useCallback(async (file: File | null) => {
    if (!file) return;

    // Convertir el archivo a base64
    const memoBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.split(",")[1]; // Solo la parte base64
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });

    // Emitir el evento "subir_documento" y procesar el callback
    socket.emit("subir_documento", { documento: memoBase64 }, (response: any) => {
      if (response.success) {
        setMemoCode(response.codigo);
        setNotificaciones((prev) => [...prev, "Documento mapeado correctamente."]);
      } else {
        console.error("Error al subir el documento:", response.message);
        alert("Error al subir el documento");
      }
    });
  }, []);

  const handleNext = useCallback(async () => {
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
  }, [bonita]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!memoCode) {
        alert("Por favor, ingrese el código del memorando.");
        return;
      }
      if (!file && (forceNewUpload || !lastCertification)) {
        alert("Por favor, cargue un archivo de certificación.");
        return;
      }

      // Extraer el nombre del archivo sin extensión
      const fileName = file?.name || "";
      const dotIndex = fileName.lastIndexOf(".");
      const baseName = dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName;

      // Convertir el archivo a base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        if (!file) return resolve("");
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          const base64String = result.split(",")[1];
          resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
      });

      // Construir el payload para enviar al back-end
      const payload = {
        nombre: `${baseName}_${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}`,
        id_registro_per: `${bonitaData?.processId}-${bonitaData?.caseId}`,
        id_tipo_documento: "5",
        document: fileBase64,
        memorando: memoCode,
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
        console.log("Respuesta del servidor:", data);

        // Mostrar mensaje de confirmación
        setIsSubmitted(true);
        setNotificaciones((prev) => [...prev, "Datos enviados correctamente."]);
        alert("Datos enviados correctamente.");
        // Reiniciamos la opción de forzar nueva subida tras el envío
        setForceNewUpload(false);
      } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Ocurrió un error al enviar los datos.");
      }
    },
    [memoCode, file, bonitaData, forceNewUpload, lastCertification]
  );

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
        <Title
          text="Solicitud de Certificación Presupuestaria"
          size="2xl"
          className="text-center text-gray-800 mb-1 text-lg"
        />
        <h1 className="font-extralight text-center mb-8">
          Subir código y documento emitido para certificación.
        </h1>

        { (lastCertification && !lastCertification.yaPasoUnAño && !forceNewUpload) ? (
          <div className="mb-4 p-4 border rounded bg-gray-50">
           <p>
    Certificación presupuestaria subida el: {lastCertification.fecha_doc.split("T")[0]}
</p>
            <p>
              Faltan: {calculateRemainingTime(lastCertification.fecha_doc)} para cumplir 1 año.
            </p>
            <Button
              type="button"
              className="mt-2 bg-green-600 text-white px-4 rounded hover:bg-green-700"
              onClick={() => setForceNewUpload(true)}
            >
              Subir nueva certificación
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <UploadFile
                id="memo-file"
                onFileChange={handleMemoFileChange}
                label="Subir archivo del memorando"
              />
            </div>

            <div className="mb-4">
              <UploadFile
                id="document-file"
                onFileChange={(file) => setFile(file)}
                label="Subir Certificación Presupuestaria"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="memoCode" className="block font-semibold">
                Código del memorando
              </label>
              <input
                id="memoCode"
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={memoCode}
                onChange={(e) => setMemoCode(e.target.value)}
                placeholder="El código se llenará automáticamente al cargar el archivo"
              />
            </div>

            <Button
              type="submit"
              className="mt-5 w-full bg-blue-600 text-white px-6 rounded hover:bg-blue-700"
            >
              Enviar Datos
            </Button>
          </>
        )}

        <Button
          className="mt-5 bg-[#931D21] text-white rounded-lg px-6 min-w-full hover:bg-blue-700 transition-colors duration-200"
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
    </div>
  );
}
