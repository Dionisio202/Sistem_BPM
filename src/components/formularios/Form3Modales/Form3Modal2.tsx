import React, { useState, useEffect } from "react";
import UploadFile from "../components/UploadFile";
import io from "socket.io-client";
import Title from "../components/TitleProps";
import { ToastContainer, toast } from "react-toastify";
import { SERVER_BACK_URL } from "../../../config.ts";
import InputField from "./components/InputField.tsx";

const socket = io(SERVER_BACK_URL); // Conecta con el backend

interface Carrera {
  id_carrera: number;
  nombre_carrera: string;
}

interface Facultad {
  id_facultad: number;
  nombre_facultad: string;
  Carreras: Carrera[];
}

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
  facultad_seleccionada?: number | null; // Para seguimiento de UI
  carrera_seleccionada?: number | null; // Para seguimiento de UI
}

interface Form3Modal2Props {
  showModal: boolean;
  closeModal: () => void;
  initialData?: Autor[];
  onSave?: (data: Autor[]) => void;
}

const Form3Modal2: React.FC<Form3Modal2Props> = ({
  closeModal,
  initialData = [],
  onSave,
}) => {
  // @ts-ignore

  const [hasMissingData, setHasMissingData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authorDataFileBase64, setAuthorDataFileBase64] = useState<
    string | null
  >(null);
  const [autores, setAutores] = useState<Autor[]>(initialData);
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  // @ts-ignore

  const [dataModified, setDataModified] = useState(false);

  // Precarga de combobox de campos del form
  useEffect(() => {
    socket.emit("obtener_facultades_carreras", (response: any) => {
      if (response.success) {
        setFacultades(JSON.parse(response.data));

        // Si hay datos iniciales, intentamos asignar las facultades y carreras
        if (initialData.length > 0) {
          const autoresConDatos = initialData.map((autor) => {
            // Si ya tiene facultad y carrera seleccionadas, las mantenemos
            if (autor.facultad_seleccionada && autor.carrera_seleccionada) {
              return autor;
            }

            // Intentamos encontrar la facultad basada en la carrera
            const autorProcesado = { ...autor };
            if (autor.id_facultad_carrera) {
              const facultades = JSON.parse(response.data);
              for (const facultad of facultades) {
                const carrera = facultad.Carreras.find(
                  (c: Carrera) => c.id_carrera === autor.id_facultad_carrera
                );
                if (carrera) {
                  autorProcesado.facultad_seleccionada = facultad.id_facultad;
                  autorProcesado.carrera_seleccionada = carrera.id_carrera;
                  break;
                }
              }
            }
            return autorProcesado;
          });

          setAutores(autoresConDatos);
        }
      } else {
        console.error(response.error);
      }
    });

    socket.emit("obtener_rol", (response: any) => {
      if (response.success === true) {
        setRoles(response.data);
      } else {
        console.error(response.error);
      }
    });
  }, [initialData]);

  // Función para manejar cambios en los archivos
  const handleFileChange = (file: File | null) => {
    if (file) {
      convertFileToBase64(file)
        .then((base64) => {
          setAuthorDataFileBase64(base64); // Guarda el archivo en Base64
          if (base64) {
            handleJson(base64);
          }
          toast.success("Archivo cargado correctamente");
          setDataModified(true);
        })
        .catch((error) => {
          toast.error(`Error al convertir el archivo: ${error}`);
        });
    } else {
      setAuthorDataFileBase64(null);
    }
  };

  // Función para convertir un archivo a base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
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

  // Función para manejar la conversión del archivo a JSON y actualizar el estado
  const handleJson = (base64: string) => {
    socket.emit(
      "cargar_documento_autores",
      {
        documento_autores: base64,
      },
      (response: any) => {
        if (response.success === true) {
          // Procesar los autores y buscar sus facultades y carreras
          const autoresConDatos = response.data.map((autor: any) => {
            const autorProcesado: Autor = {
              ...autor,
              facultad_seleccionada: null,
              carrera_seleccionada: null,
            };

            // Intenta buscar la facultad y carrera para este autor
            if (autor.id_facultad_carrera) {
              for (const facultad of facultades) {
                const carrera = facultad.Carreras.find(
                  (c) => c.id_carrera === autor.id_facultad_carrera
                );
                if (carrera) {
                  autorProcesado.facultad_seleccionada = facultad.id_facultad;
                  autorProcesado.carrera_seleccionada = carrera.id_carrera;
                  break;
                }
              }
            }
            return autorProcesado;
          });
          setAutores(autoresConDatos);
          setDataModified(true);
          toast.success(response.message);
        } else {
          toast.error(response.message);
          console.error(response.error);
        }
      }
    );
  };

  // Función para manejar el cambio de facultad por autor
  const manejarCambioFacultad = (
    index: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const idFacultad = parseInt(event.target.value);
    const autoresActualizados = [...autores];
    autoresActualizados[index].facultad_seleccionada = idFacultad;
    autoresActualizados[index].carrera_seleccionada = null; // Reinicia la carrera seleccionada
    setAutores(autoresActualizados);
    setDataModified(true);
  };

  // Función para manejar el cambio de carrera por autor
  const manejarCambioCarrera = (
    index: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const idCarrera = parseInt(event.target.value);
    const autoresActualizados = [...autores];
    autoresActualizados[index].carrera_seleccionada = idCarrera;
    autoresActualizados[index].id_facultad_carrera = idCarrera; // Actualiza el ID de la carrera en el autor
    setAutores(autoresActualizados);
    setDataModified(true);
  };

  // Función para manejar el cambio de rol por autor
  const handleRoleChange = (
    index: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const idRol = parseInt(event.target.value);
    const autoresActualizados = [...autores];
    autoresActualizados[index].id_rol = idRol;
    setAutores(autoresActualizados);
    setDataModified(true);
  };

  // Función para guardar los datos y devolverlos al componente padre
  const handleSave = async () => {
    if (autores.length === 0 && !authorDataFileBase64) {
      setHasMissingData(true);
      toast.warning(
        "No hay datos para guardar. Por favor, carga un archivo o asegúrate de tener autores definidos."
      );
    }

    // Verificar que todos los autores tengan facultad, carrera y rol seleccionados
    const autorIncompleto = autores.some(
      (autor) =>
        !autor.facultad_seleccionada ||
        !autor.carrera_seleccionada ||
        !autor.id_rol
    );

    if (autorIncompleto) {
      toast.warning(
        "Por favor, completa todos los datos de los autores antes de guardar."
      );
      return;
    }

    setLoading(true);
    try {
      // Preparar los datos para guardar
      const datosParaGuardar = autores.map((autor) => {
        const { facultad_seleccionada, carrera_seleccionada, ...rest } = autor;
        return rest as Autor; // Eliminar propiedades de UI
      });
      setAutores(datosParaGuardar);
      if (onSave) onSave(datosParaGuardar);
      toast.success("Datos guardados correctamente");
      closeModal();
    } catch (error) {
      toast.error(`Error al guardar los datos: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-white/40 flex justify-center items-center p-4">
      <div className="bg-amber-50 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-zinc-800">
          {/* Título principal */}
          <Title
            text="Atención de Solicitud de Registro de Propiedad Intelectual"
            size="2xl"
            className="text-center text-gray-800 mb-3 text-lg sm:text-xl md:text-2xl"
          />
          {/* Subtítulo */}
          <h1 className="text-sm font-bold text-center text-gray-900 mb-6 sm:mb-8 md:mb-9">
            Revisión y Análisis de Requerimiento
          </h1>

          {/* Campo para cargar archivos */}
          <UploadFile
            id="author-data-file"
            onFileChange={(file) => handleFileChange(file)}
            label="Cargar Datos informativos de autores"
          />

          {/* Lista de Autores */}
          {autores.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Lista de Autores:</h2>
              <div className="space-y-4 sm:space-y-6">
                {autores.map((autor, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg shadow-sm bg-gray-50"
                  >
                    <h3 className="font-semibold text-base mb-2">
                      Autor {index + 1}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <InputField
                          label="Nombre"
                          value={autor.nombre}
                          onChange={(e) => {
                            const nuevosAutores = [...autores];
                            nuevosAutores[index].nombre = e.target.value;
                            setAutores(nuevosAutores);
                            setDataModified(true);
                          }}
                        />
                        <InputField
                          label="Identificación"
                          value={autor.identificacion}
                          onChange={(e) => {
                            const nuevosAutores = [...autores];
                            nuevosAutores[index].identificacion =
                              e.target.value;
                            setAutores(nuevosAutores);
                            setDataModified(true);
                          }}
                        />
                        <InputField
                          label="Correo"
                          value={autor.correo}
                          onChange={(e) => {
                            const nuevosAutores = [...autores];
                            nuevosAutores[index].correo = e.target.value;
                            setAutores(nuevosAutores);
                            setDataModified(true);
                          }}
                        />
                      </div>
                      <div>
                        <InputField
                          label="Teléfono"
                          value={autor.telefono}
                          onChange={(e) => {
                            const nuevosAutores = [...autores];
                            nuevosAutores[index].telefono = e.target.value;
                            setAutores(nuevosAutores);
                            setDataModified(true);
                          }}
                        />
                        <InputField
                          label="Dirección"
                          value={autor.direccion}
                          onChange={(e) => {
                            const nuevosAutores = [...autores];
                            nuevosAutores[index].direccion = e.target.value;
                            setAutores(nuevosAutores);
                            setDataModified(true);
                          }}
                        />
                        <InputField
                          label="Participación"
                          value={autor.porcentaje_participacion.toString()}
                          onChange={(e) => {
                            const nuevosAutores = [...autores];
                            nuevosAutores[index].porcentaje_participacion =
                              parseFloat(e.target.value);
                            setAutores(nuevosAutores);
                            setDataModified(true);
                          }}
                          type="number"
                        />
                      </div>
                    </div>

                    {/* Selección de Facultad */}
                    <div className="mt-4">
                      <label
                        htmlFor={`facultad-${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Seleccione una Facultad:
                      </label>
                      <select
                        id={`facultad-${index}`}
                        onChange={(e) => manejarCambioFacultad(index, e)}
                        value={autor.facultad_seleccionada ?? ""}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21] text-xs sm:text-sm"
                      >
                        <option value="">Seleccione una facultad</option>
                        {facultades.map((facultad) => (
                          <option
                            key={facultad.id_facultad}
                            value={facultad.id_facultad}
                          >
                            {facultad.nombre_facultad}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Selección de Carrera */}
                    {autor.facultad_seleccionada && (
                      <div className="mt-4">
                        <label
                          htmlFor={`carrera-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Seleccione una Carrera:
                        </label>
                        <select
                          id={`carrera-${index}`}
                          onChange={(e) => manejarCambioCarrera(index, e)}
                          value={autor.carrera_seleccionada ?? ""}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21] text-xs sm:text-sm"
                        >
                          <option value="">Seleccione una carrera</option>
                          {facultades
                            .find(
                              (fac) =>
                                fac.id_facultad === autor.facultad_seleccionada
                            )
                            ?.Carreras.map((carrera) => (
                              <option
                                key={carrera.id_carrera}
                                value={carrera.id_carrera}
                              >
                                {carrera.nombre_carrera}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* Selección de Rol */}
                    <div className="mt-4">
                      <label
                        htmlFor={`rol-${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Seleccione un Rol:
                      </label>
                      <select
                        id={`rol-${index}`}
                        value={autor.id_rol || ""}
                        onChange={(e) => handleRoleChange(index, e)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21] text-xs sm:text-sm"
                        disabled={loading}
                      >
                        <option value="">Seleccione un cargo</option>
                        {roles.map((rol) => (
                          <option key={rol.id} value={rol.id}>
                            {rol.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end p-4 mt-6 bg-gray-50 border-t border-gray-200">
            <button
              onClick={closeModal}
              className="bg-gray-500 text-white text-xs sm:text-sm px-4 py-2 rounded-lg hover:bg-gray-600 mr-2"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="bg-[#931D21] text-white text-xs sm:text-sm px-4 py-2 rounded-lg hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Procesando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Form3Modal2;