import { useState, useCallback, useEffect } from "react";
import io from "socket.io-client";
import Button from "../UI/button";
import Title from "./components/TitleProps";
import Modal from "./components/Modal";
import UploadFile from "./components/UploadFile";
import { ModalData } from "../../interfaces/registros.interface"; // Asegúrate de que la ruta sea correcta
// @ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";
import { useBonitaService } from "../../services/bonita.service";
import { SERVER_BACK_URL } from "../../config.ts";

const socket = io(SERVER_BACK_URL); // Conecta con el backend

export default function UploadForm() {
  const [intellectualPropertyFileBase64, setIntellectualPropertyFileBase64] =
    useState<string | null>(null);
  const [authorDataFileBase64, setAuthorDataFileBase64] = useState<
    string | null
  >(null);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [tipoMemorando, setTipoMemorando] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [loading, setLoading] = useState(false); // Estado para el indicador de carga
  const bonita: BonitaUtilities = new BonitaUtilities();
  const handleTipoMemorandoChange = (e: any) => {
    setTipoMemorando(e.target.value);
  };

  // Usamos el servicio modificado: únicamente obtenerDatosBonita y obtenerUsuarioAutenticado
  const { obtenerDatosBonita, obtenerUsuarioAutenticado } = useBonitaService();

  const [bonitaData, setBonitaData] = useState<any>(null);
  const [jsonAutroes, setJsonAutores] = useState<any>(null);

  // Efecto para obtener los datos de Bonita usando las APIs sin privilegios de admin
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener el usuario autenticado
        const usuario = await obtenerUsuarioAutenticado();
        if (usuario) {
          // 2. Con el user_id, obtener la tarea actual y datos asociados
          const bonitaData = await obtenerDatosBonita(usuario.user_id);
          if (bonitaData) {
            console.log("Datos de Bonita:", bonitaData);
            setBonitaData(bonitaData);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos de Bonita:", error);
      }
    };

    fetchData();
  }, [obtenerDatosBonita, obtenerUsuarioAutenticado]);

  // Función para manejar cambios en los archivos
  const handleFileChange = useCallback(
    (file: File | null, fileType: string) => {
      if (file) {
        console.log(`Archivo subido para ${fileType}:`, file);
        convertFileToBase64(file).then((base64) => {
          if (fileType === "Solicitud de Registro de Propiedad Intelectual") {
            setIntellectualPropertyFileBase64(base64);
          } else {
            setAuthorDataFileBase64(base64);
          }
        });
      }
    },
    []
  );

  // Función para avanzar a la siguiente tarea
  const handleNext = async () => {
    try {
      await bonita.changeTask();
      alert("Avanzando a la siguiente página...");
    } catch (error) {
      console.error("Error al cambiar la tarea:", error);
      alert("Ocurrió un error al intentar avanzar.");
    }
  };

  // Función para guardar los documentos y mostrar el modal
  const handleSave = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!intellectualPropertyFileBase64 || !authorDataFileBase64) {
      setModalData({
        success: false,
        message: "Por favor, sube ambos archivos.",
        autores: [],
        productos: [],
      });
      setShowModal(true);
      return;
    }

    try {
      setLoading(true); // Activar el indicador de carga
      setIsNextDisabled(false);

      // Timeout para evitar que el botón se quede en "Procesando..."
      const timeout = setTimeout(() => {
        setLoading(false);
        console.error("❌ El servidor no respondió a tiempo.");
        setModalData({
          success: false,
          message: "El servidor no respondió a tiempo. Inténtalo de nuevo.",
          autores: [],
          productos: [],
        });
        setShowModal(true);
      }, 10000); // 10 segundos

      // Enviar los documentos al backend
      socket.emit(
        "procesar_documentos",
        {
          documento_autores: authorDataFileBase64,
          documento_productos: intellectualPropertyFileBase64,
        },
        (response: any) => {
          clearTimeout(timeout); // Cancelar el timeout si el servidor responde
          setLoading(false); // Desactivar el indicador de carga

          if (response && response.success) {
            setJsonAutores(JSON.parse(response.autores));
            console.log("📢 Documentos procesados correctamente:", response);
            setModalData({
              success: response.success,
              message: response.message,
              autores: JSON.parse(response.autores),
              productos: JSON.parse(response.productos),
            });
          } else {
            console.error(
              "❌ Error en la respuesta del servidor:",
              response?.message
            );
            setModalData({
              success: false,
              message: response?.message || "Error desconocido",
              autores: [],
              productos: [],
            });
          }
          setShowModal(true); // Mostrar el modal con la respuesta
        }
      );
    } catch (error) {
      setLoading(false); // Desactivar el indicador de carga en caso de error
      console.error("Error al guardar los documentos:", error);
      setModalData({
        success: false,
        message: "Error al procesar los documentos. Inténtalo de nuevo.",
        autores: [],
        productos: [],
      });
      setShowModal(true);
    }
  };

  // Función para guardar los datos editados
  const handleSaveEditedData = async (editedData: any) => {
    try {
      if (!authorDataFileBase64 || !intellectualPropertyFileBase64) {
        throw new Error("No se encontraron los archivos base64.");
      }
      // Se establece el tipo y se asignan los productos extraídos del JSON de productos
      editedData.tipo = parseInt(tipoMemorando);

      console.log("Json de productos editados:", editedData);
      console.log("Json de autores editados:", jsonAutroes);

      // Enviar los datos editados al backend como JSON string
      socket.emit(
        "agregar_producto_datos",
        {
          id_registro: `${bonitaData.processId}-${bonitaData.caseId}`,
          jsonProductos: JSON.stringify(editedData), // Se envía como cadena
          memorando: editedData.codigoMemorando,
        },
        (response: any) => {
          if (response.success) {
            const codigoCombinado =
              bonitaData.processId + "-" + bonitaData.caseId;
            console.log("📢 ID", codigoCombinado);
            console.log("📢 Datos editados guardados correctamente:", response);
            alert("Datos editados guardados correctamente.");
            alert("Insertando autores...");
            // Enviar los autores, también convertidos a cadena JSON
            socket.emit(
              "set_autores",
              {
                codigo: codigoCombinado,
                autores: JSON.stringify(jsonAutroes),
              },
              (response: any) => {
                if (response.success) {
                  console.log("📢 Autores guardados correctamente:", response);
                  alert("Datos editados guardados correctamente.");
                } else {
                  console.error(
                    "❌ Error al guardar los autores:",
                    response.message
                  );
                  alert("Error al guardar los datos editados.");
                }
              }
            );
          } else {
            console.error(
              "❌ Error al guardar los datos editados:",
              response.message
            );
            alert("Error al guardar los datos editados.");
          }
        }
      );
    } catch (error) {
      console.error("Error al guardar los datos editados:", error);
      alert("Error al guardar los datos editados.");
    }
  };

  // Función para convertir un archivo a base64
  const convertFileToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          const base64 = reader.result.split(",")[1];
          if (base64) resolve(base64);
          else reject("No se pudo extraer la parte base64 del archivo.");
        } else {
          reject("Error al procesar el archivo.");
        }
      };
      reader.onerror = () => reject("Error al leer el archivo.");
      reader.readAsDataURL(file);
    });
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex flex-col items-center p-1 bg-gradient-to-r to-gray-100 min-h-screen">
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-xl border border-gray-700">
        <Title
          text="Atención de Solicitud de Registro de Propiedad Intelectual"
          size="2xl"
          className="text-center text-gray-800 mb-3 text-lg"
        />
        <h1 className="text-sm font-bold text-center text-gray-900 mb-9">
          Revisión y Análisis de Requerimiento
        </h1>

        <UploadFile
          id="intellectual-property-file"
          onFileChange={(file) =>
            handleFileChange(
              file,
              "Solicitud de Registro de Propiedad Intelectual"
            )
          }
          label="Cargar Solicitud de registro de propiedad intelectual"
        />

        <UploadFile
          id="author-data-file"
          onFileChange={(file) =>
            handleFileChange(file, "Datos informativos de autores")
          }
          label="Cargar Datos informativos de autores"
        />

        <div className="flex justify-center mt-6 space-x-4">
          <Button
            className="bg-[#931D21] text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition-colors duration-200"
            onClick={handleNext}
            disabled={isNextDisabled}
          >
            Siguiente
          </Button>
          <Button
            className="bg-[#931D21] text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition-colors duration-200"
            onClick={handleSave}
            disabled={
              !intellectualPropertyFileBase64 ||
              !authorDataFileBase64 ||
              loading
            }
          >
            {loading ? "Procesando..." : "Guardar"}
          </Button>
        </div>

        {showModal && modalData && (
          <Modal
            showModal={showModal}
            closeModal={closeModal}
            modalData={modalData}
            onSave={handleSaveEditedData}
            tipoMemorando={tipoMemorando}
            handleTipoMemorandoChange={handleTipoMemorandoChange}
          />
        )}
      </div>
    </div>
  );
}