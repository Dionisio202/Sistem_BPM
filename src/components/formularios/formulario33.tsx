import { useEffect, useState } from "react";
import io from "socket.io-client";
import Button from "../UI/button";
import Title from "./components/TitleProps";
import ModalP from "./components/ModalP";
import { FaFileAlt, FaRegFilePdf } from "react-icons/fa";
import Form3Modal1 from "./Form3Modales/Form3Modal1";
import Form3Modal2 from "./Form3Modales/Form3Modal2";
import { SERVER_BACK_URL } from "../../config.ts";
import { ToastContainer, toast } from "react-toastify";
import { temporalData } from "../../interfaces/actividad.interface.ts";
import { useCombinedBonitaData } from "../bonita/hooks/obtener_datos_bonita.tsx";
import { useSaveTempState } from "../bonita/hooks/datos_temprales";
//@ts-ignore
import BonitaUtilities from "../bonita/bonita-utilities";

interface Autor {
  id_persona: number | null;
  id_rol: number;
  id_facultad_carrera: number;
  ciudad: string | null;
  identificacion: string;
  nombre: string;
  telefono: string;
  fecha_nacimiento: Date | null;
  direccion: string;
  correo: string;
  id_autor_producto?: number;
  id_producto?: number;
  id_autor?: number;
  porcentaje_participacion: number;
  facultad_seleccionada?: number | null;
  carrera_seleccionada?: number | null;
}

const socket = io(SERVER_BACK_URL);

export default function UploadForm() {
  const bonita: BonitaUtilities = new BonitaUtilities();
  const [isModal1Open, setIsModal1Open] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const { usuario, bonitaData, tareaActual } = useCombinedBonitaData();
  const [json, setJson] = useState<temporalData | null>(null);
  const [formDataAutores, setFormDataAutores] = useState<Autor[]>([]);
  const [formDataProductos, setFormDataProductos] = useState<[]>([]);
  const { startAutoSave, saveFinalState } = useSaveTempState(socket);
  const [tipoOperacion, setTipoOperacion] = useState<boolean>(false);
  const [idRegistro, setIdRegistro] = useState<string>("");

  useEffect(() => {
    if (bonitaData && usuario) {
      const registroId = `${bonitaData.processId}-${bonitaData.caseId}`;
      setIdRegistro(registroId);
      socket.emit(
        "comprobar_estado_registro",
        { id_registro: registroId },
        (response: any) => {
          if (response.success) {
            setTipoOperacion(response.data); // ✅ Actualización correcta
          }
        }
      );

      const data: temporalData = {
        id_registro: registroId,
        id_tarea: parseInt(bonitaData.taskId),
        jsonData: JSON.stringify({
          autores: formDataAutores,
          productos: formDataProductos,
        }),
        id_funcionario: parseInt(usuario.user_id),
        nombre_tarea: tareaActual?.name ?? "",
        eliminar_documentos:false
      };
      setJson(data);
      startAutoSave(data, 10000, "En Proceso");
    }
  }, [bonitaData, usuario, tareaActual]);

  // Manejadores de modales
  const openModal1 = () => setIsModal1Open(true);
  const openModal2 = () => setIsModal2Open(true);
  const closeModal1 = () => setIsModal1Open(false);
  const closeModal2 = () => setIsModal2Open(false);

  // Manejadores de datos
  const handleSaveAutores = (autores: Autor[]) => {
    setFormDataAutores(autores);
    closeModal2();
    toast.success("Autores guardados exitosamente");
  };

  const handleSaveProductos = (productos: any) => {
    console.log("Productos recibidos:", productos);
    setFormDataProductos(productos);
    closeModal1();
    toast.success("Productos guardados exitosamente");
  };

  const handleFinalSave = async () => {
    if (!json) {
      toast.error("Error de configuración del proceso");
      return;
    }

    if (formDataAutores.length === 0 || formDataProductos.length === 0) {
      toast.error("Complete ambos formularios primero");
      return;
    }

    // Validar porcentajes de participación
    const totalParticipacion = formDataAutores.reduce(
      (acc, autor) => acc + autor.porcentaje_participacion,
      0
    );

    if (totalParticipacion !== 100) {
      toast.error("La suma de porcentajes debe ser 100%");
      return;
    }

    // Guardar estado final
    console.log("autores", formDataAutores);
    console.log("productos", formDataProductos);
    if (!bonitaData) {
      throw new Error("No se encontraron los datos de Bonita.");
    }
    socket.emit(
      "agregar_producto_datos",
      {
        id_registro: `${bonitaData.processId}-${bonitaData.caseId}`,
        jsonProductos: JSON.stringify(formDataProductos),
        //@ts-ignore
        memorando: formDataProductos.codigoMemorando,
        esEdicion: tipoOperacion,
        id_tarea:`${bonitaData?.processId}-${bonitaData?.caseId}-${bonitaData?.taskId}`,
      },
      (response: any) => {
        if (response.success) {
          const codigoCombinado =
            bonitaData.processId + "-" + bonitaData.caseId;
          toast.success("Datos Verificados y Guardados Correctamente");
          // Enviar los autores, también convertidos a cadena JSON
          socket.emit(
            "set_autores",
            {
              codigo: codigoCombinado,
              autores: JSON.stringify(formDataAutores),
            },
            (response: any) => {
              if (response.success) {
                console.log(
                  "📢 Autores guardados correctamente:",
                  response.message
                );
                toast.success("Datos editados guardados correctamente.");
              } else {
                console.error(
                  "❌ Error al guardar los autores:",
                  response.message
                );
                toast.error("Error al guardar los datos editados.");
              }
            }
          );
        } else {
          console.error(
            "❌ Error al guardar los datos editados:",
            response.message
          );
          toast.info(
            "Ya se encuentran registrados todos los productos de este Memorando."
          );
          toast.info("Ingrese un Nuevo Registro.");
        }
      }
    );
    toast.success("Proceso guardado exitosamente");
    // guardado final
    saveFinalState({
      ...json,
      jsonData: JSON.stringify({
        autores: formDataAutores,
        productos: formDataProductos,
      }),
    });
    bonita.changeTask();
  };

  return (
    <div className="flex flex-col items-center p-1 bg-gradient-to-r from-gray-200 to-gray-100 min-h-screen">
      <div className="w-full max-w-4xl bg-white/50 p-8 rounded-xl shadow-xl border border-gray-300 backdrop-blur-md">
        <Title
          text="Atención de Solicitud de Registro de Propiedad Intelectual"
          size="2xl"
          className="text-center text-gray-800 mb-3 text-lg"
        />

        {/* Contenedor de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Card Productos */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center text-center">
              <FaFileAlt className="text-[#931D21] text-4xl mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Registro de Productos
              </h2>
              <Button
                className="bg-[#931D21] text-white rounded-lg px-6 py-2 hover:bg-[#7A171A]"
                onClick={openModal1}
              >
                {formDataProductos.length ? "Editar" : "Comenzar"}
              </Button>
            </div>
          </div>

          {/* Card Autores */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center text-center">
              <FaRegFilePdf className="text-blue-600 text-4xl mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Registro de Autores
              </h2>
              <Button
                className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700"
                onClick={openModal2}
              >
                {formDataAutores.length ? "Editar" : "Comenzar"}
              </Button>
            </div>
          </div>
        </div>

        {/* Botón de Guardado Final */}
        <div className="flex justify-center mt-6">
          <Button
            className="bg-[#931D21] text-white rounded-lg px-8 py-3 hover:bg-[#7A171A] transition-colors duration-200 text-sm sm:text-base"
            onClick={handleFinalSave}
          >
            Guardar Proceso Completo
          </Button>
        </div>
      </div>

      {/* Modales */}
      <ModalP
        isOpen={isModal1Open}
        onClose={closeModal1}
        title="Registro de Productos"
      >
        <Form3Modal1
          id_registro={idRegistro}
          showModal={isModal1Open}
          closeModal={closeModal1}
          onSave={handleSaveProductos}
          initialData={formDataProductos}
        />
      </ModalP>

      <ModalP
        isOpen={isModal2Open}
        onClose={closeModal2}
        title="Registro de Autores"
      >
        <Form3Modal2
          showModal={isModal2Open}
          closeModal={closeModal2}
          onSave={handleSaveAutores}
          initialData={formDataAutores}
        />
      </ModalP>
      <ToastContainer/>
    </div>
  );
}