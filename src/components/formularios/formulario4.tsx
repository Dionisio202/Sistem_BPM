import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import UploadFile from "./components/UploadFile"; // Componente para cargar archivos
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import Title from "./components/TitleProps";
import Button from "../UI/button";
import { SERVER_BACK_URL } from "../../config.ts";
import { useBonitaService } from "../../services/bonita.service";

// Crear instancia de socket (podrías moverla a un contexto o hook personalizado)
const socket = io(SERVER_BACK_URL);

export default function UploadForm() {
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
  // @ts-ignore
  const [isSubmitted, setIsSubmitted] = useState(false); // Estado para controlar el envío

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

  // Función para manejar el cambio del archivo del memorando usando Socket.io
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
      if (!file) {
        alert("Por favor, cargue un archivo de certificación.");
        return;
      }

      // Extraer el nombre del archivo sin extensión
      const fileName = file.name;
      const dotIndex = fileName.lastIndexOf(".");
      const baseName = dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName;

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

      // Construir el payload para enviar al back-end
      const payload = {
        nombre: `${baseName}_${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}`,
        id_registro_per: `${bonitaData?.processId}-${bonitaData?.caseId}`,
        id_tipo_documento: "3",
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
      } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Ocurrió un error al enviar los datos.");
      }
    },
    [memoCode, file, bonitaData]
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
