import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import UploadFile from "../components/UploadFile";
import { SERVER_BACK_URL } from "../../../config.ts";
import {
  ModalProps,
  TipoProducto,
} from "../../../interfaces/registros.interface";
import { Facultad } from "../../../interfaces/facultades.interface.ts";
import InputField from "./components/InputField.tsx";
import Section from "./components/Section.tsx";
import SelectField from "./components/Selectfield.tsx";
import { ToastContainer, toast } from "react-toastify";
import Button from "../../UI/button.tsx";

const socket = io(SERVER_BACK_URL);

interface FormData {
  productos: {
    codigoMemorando: string;
    lugar: string;
    destinatario: {
      nombre: string;
      titulo: string;
      cargo: string;
      institucion: string;
    };
    solicitante: {
      nombre: string;
      cargo: string;
      facultad: string;
    };
    proyecto: {
      tipo: string;
      titulo: string;
      resolucion: {
        numero: string;
        fecha: string;
      };
    };
    productos: any[];
    tipoMemorando: string;
  };
}

const Form3Modal1: React.FC<ModalProps> = ({
  showModal,
  onSave,
  closeModal,
  tipoMemorando,
  handleTipoMemorandoChange,
}) => {
  const [editedData, setEditedData] = useState<FormData>({
    productos: {
      codigoMemorando: "",
      lugar: "",
      destinatario: {
        nombre: "",
        titulo: "",
        cargo: "",
        institucion: "",
      },
      solicitante: {
        nombre: "",
        cargo: "",
        facultad: "",
      },
      proyecto: {
        tipo: "",
        titulo: "",
        resolucion: {
          numero: "",
          fecha: "",
        },
      },
      productos: [],
      tipoMemorando: "",
    },
  });
  const [tiposProductos, setTiposProductos] = useState<TipoProducto[]>([]);
  const [facultadesCarreras, setFacultadesCarreras] = useState<Facultad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facultadSeleccionada, setFacultadSeleccionada] = useState("");
  const [hasMissingData, setHasMissingData] = useState(false);
  const [intellectualPropertyFileBase64, setIntellectualPropertyFileBase64] =
    useState<string | null>(null);

  // Cargar tipos de productos
  useEffect(() => {
    if (showModal) {
      setError(null);
      setLoading(true);

      socket.emit("obtener_tipos_productos", (response: any) => {
        if (response.success) {
          const tiposMapeados = response.data.map((tipo: any) => ({
            id: tipo.id_tipo_producto,
            nombre: tipo.nombre,
          }));
          setTiposProductos(tiposMapeados);

          if (editedData.productos.tipoMemorando) {
            const tipoSeleccionado = tiposMapeados.find(
              (t: any) => t.nombre === editedData.productos.tipoMemorando
            );
            if (tipoSeleccionado) {
              setEditedData((prev) => ({
                ...prev,
                productos: {
                  ...prev.productos,
                  tipoMemorando: tipoSeleccionado.id.toString(),
                },
              }));
            }
          }
            } else {
          console.error("Error al obtener tipos:", response.message);
          setError("Error al cargar tipos de productos");
        }
        setLoading(false);
      });
    }
  }, [showModal, editedData.productos.tipoMemorando]);

  // Cargar facultades y carreras
  useEffect(() => {
    if (showModal) {
      socket.emit("obtener_facultades_carreras", (response: any) => {
        if (response.success && response.data && response.data.length > 0) {
          try {
            const parsedData = JSON.parse(response.data[0].ResultadoJSON);
            setFacultadesCarreras(parsedData);
          } catch (parseError) {
            console.error("Error al parsear facultades:", parseError);
            setError("Error al cargar facultades y carreras");
          }
        } else {
          console.error("Error al obtener facultades:", response.message);
          setError("Error al cargar facultades y carreras");
        }
      });
    }
  }, [showModal]);

  const handleFacultadChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFacultadSeleccionada(e.target.value);
      setEditedData((prev) => ({
        ...prev,
        productos: {
          ...prev.productos,
          solicitante: {
            ...prev.productos.solicitante,
            facultad: e.target.value,
          },
        },
      }));
    },
    []
  );

  const handleMemoFileChange = useCallback(async (file: File | null) => {
    if (!file) return;
    try {
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

      socket.emit(
        "subir_documento",
        { documento: memoBase64 },
        (response: any) => {
          if (response.success) {
            setEditedData((prev) => ({
              ...prev,
              productos: {
                ...prev.productos,
                codigoMemorando: response.codigo,
              },
            }));
          } else {
            console.error("Error al subir el documento:", response.message);
            toast.error("Error al subir el documento");
          }
        }
      );
    } catch (err) {
      console.error("Error procesando el archivo:", err);
      toast.error("Error al procesar el archivo");
    }
  }, []);

  const handleChange = useCallback((path: string, value: string) => {
    const keys = path.split(".");
    setEditedData((prev) => {
      const updatedData = { ...prev };
      let current: any = updatedData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updatedData;
    });
  }, []);

  const checkMissingData = useCallback(() => {
    const requiredFields = [
      "productos.codigoMemorando",
      "productos.lugar",
      "productos.destinatario.nombre",
      "productos.destinatario.titulo",
      "productos.destinatario.cargo",
      "productos.destinatario.institucion",
      "productos.solicitante.nombre",
      "productos.solicitante.cargo",
      "productos.solicitante.facultad",
      "productos.proyecto.tipo",
      "productos.proyecto.titulo",
      "productos.proyecto.resolucion.numero",
      "productos.proyecto.resolucion.fecha",
    ];
    const missingFields = requiredFields.filter((field) => {
      const keys = field.split(".");
      let value: any = editedData;
      for (const key of keys) {
        value = value[key];
        if (value === undefined || value === "") return true;
      }
      return false;
    });
    setHasMissingData(missingFields.length > 0);
  }, [editedData]);

  const handleFileChange = useCallback(
    async (file: File | null, fileType: string) => {
      if (file) {
        try {
          const base64 = await convertFileToBase64(file);
          if (fileType === "Solicitud de Registro de Propiedad Intelectual") {
            setIntellectualPropertyFileBase64(base64);
            toast.success("Archivo cargado correctamente");
          }
        } catch (error) {
          console.error("Error al convertir el archivo:", error);
          toast.error("Error al cargar el archivo");
        }
      }
    },
    []
  );

  const convertFileToBase64 = useCallback((file: File): Promise<string> => {
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
  }, []);

  const handleSave = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (!intellectualPropertyFileBase64) {
        toast.error("Por favor, sube el archivo antes de guardar.");
        return;
      }

      try {
        setLoading(true); // Activar el indicador de carga

        // Timeout para evitar que el botón se quede en "Procesando..."
        const timeout = setTimeout(() => {
          setLoading(false);
          toast.error("El servidor no respondió a tiempo. Inténtalo de nuevo.");
        }, 30000); // Aumenta el timeout a 30 segundos

        // Enviar el archivo al backend para mapeo
        socket.emit(
          "procesar_documento", // Asegúrate de que este sea el evento correcto en el backend
          { documento: intellectualPropertyFileBase64 },
          (response: any) => {
            clearTimeout(timeout); // Cancelar el timeout si el servidor responde
            setLoading(false); // Desactivar el indicador de carga

            // Inspeccionar el JSON devuelto por el backend
            console.log("Respuesta del backend:", response);

            if (response && response.success) {
              // Actualiza el estado con los datos mapeados
              setEditedData((prev) => ({
                ...prev,
                productos: {
                  ...prev.productos,
                  ...response.data, // Asegúrate de que el backend devuelva los datos en el formato correcto
                },
              }));
              toast.success("Documento mapeado correctamente");
            } else {
              console.error(
                "Error en la respuesta del servidor:",
                response?.message
              );
              toast.error(response?.message || "Error desconocido");
            }
          }
        );
      } catch (error) {
        setLoading(false); // Desactivar el indicador de carga en caso de error
        console.error("Error al guardar los documentos:", error);
        toast.error("Error al procesar los documentos. Inténtalo de nuevo.");
      }
    },
    [intellectualPropertyFileBase64]
  );

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-700/50 backdrop-blur-md flex justify-center items-center p-4">
      <div className="bg-amber-50 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-center">
              Registro de Propiedad Intelectual
            </h2>
            <p className="text-base text-center font-medium mb-10">
              Revise que los datos de registro sean correctos y edite en caso de
              incongruencias.
            </p>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <div className="mb-4">
                <UploadFile
                  id="memo-file"
                  onFileChange={handleMemoFileChange}
                  label="Subir archivo del memorando"
                />

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
                <Button
                  className="bg-[#931D21] text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition-colors duration-200"
                  onClick={handleSave}
                  disabled={loading || !intellectualPropertyFileBase64}
                >
                  {loading ? "Procesando..." : "Guardar"}
                </Button>
              </div>
              <InputField
                label="Código de Memorando"
                value={editedData.productos.codigoMemorando}
                onChange={(e) =>
                  handleChange("productos.codigoMemorando", e.target.value)
                }
              />
              <SelectField
                label="Tipo de Registro"
                value={tipoMemorando}
                onChange={handleTipoMemorandoChange}
                options={tiposProductos.map((tipo) => ({
                  value: tipo.id.toString(),
                  label: tipo.nombre,
                }))}
                disabled={loading}
              />
              <InputField
                label="Lugar"
                value={editedData.productos.lugar}
                onChange={(e) => handleChange("productos.lugar", e.target.value)}
              />
              <Section title="Destinatario">
                <InputField
                  label="Nombre"
                  value={editedData.productos.destinatario.nombre}
                  onChange={(e) =>
                    handleChange("productos.destinatario.nombre", e.target.value)
                  }
                />
                <InputField
                  label="Título"
                  value={editedData.productos.destinatario.titulo}
                  onChange={(e) =>
                    handleChange("productos.destinatario.titulo", e.target.value)
                  }
                />
                <InputField
                  label="Cargo"
                  value={editedData.productos.destinatario.cargo}
                  onChange={(e) =>
                    handleChange("productos.destinatario.cargo", e.target.value)
                  }
                />
                <InputField
                  label="Institución"
                  value={editedData.productos.destinatario.institucion}
                  onChange={(e) =>
                    handleChange("productos.destinatario.institucion", e.target.value)
                  }
                />
              </Section>
              <Section title="Solicitante">
                <InputField
                  label="Nombre"
                  value={editedData.productos.solicitante.nombre}
                  onChange={(e) =>
                    handleChange("productos.solicitante.nombre", e.target.value)
                  }
                />
                <SelectField
                  label="Cargo"
                  value={editedData.productos.solicitante.cargo}
                  onChange={(e) =>
                    handleChange("productos.solicitante.cargo", e.target.value)
                  }
                  options={[
                    { value: "Director", label: "Director" },
                    { value: "Docente", label: "Docente" },
                    { value: "Rector", label: "Rector" },
                    { value: "Decano", label: "Decano" },
                  ]}
                />
                <SelectField
                  label="Facultad"
                  value={facultadSeleccionada}
                  onChange={handleFacultadChange}
                  options={facultadesCarreras.map((facultad) => ({
                    value: facultad.id_facultad.toString(),
                    label: facultad.nombre_facultad,
                  }))}
                  disabled={loading}
                />
              </Section>
              <Section title="Productos">
                {editedData.productos.productos.map((producto: any, index: number) => (
                  <InputField
                    key={producto.id || index}
                    label="Nombre del Producto"
                    value={producto.nombre}
                    onChange={(e) =>
                      handleChange(`productos.productos.${index}.nombre`, e.target.value)
                    }
                  />
                ))}
              </Section>
              <Section title="Proyecto">
                <InputField
                  label="Tipo"
                  value={editedData.productos.proyecto.tipo}
                  onChange={(e) =>
                    handleChange("productos.proyecto.tipo", e.target.value)
                  }
                />
                <InputField
                  label="Título"
                  value={editedData.productos.proyecto.titulo}
                  onChange={(e) =>
                    handleChange("productos.proyecto.titulo", e.target.value)
                  }
                />
                <InputField
                  label="Resolución Número"
                  value={editedData.productos.proyecto.resolucion.numero}
                  onChange={(e) =>
                    handleChange("productos.proyecto.resolucion.numero", e.target.value)
                  }
                />
                <InputField
                  label="Resolución Fecha"
                  value={editedData.productos.proyecto.resolucion.fecha}
                  onChange={(e) =>
                    handleChange("productos.proyecto.resolucion.fecha", e.target.value)
                  }
                />
              </Section>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white text-xs px-4 py-2 rounded-lg hover:bg-gray-600 mr-2"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-[#931D21] text-white text-xs px-4 py-2 rounded-lg hover:bg-red-700"
            disabled={hasMissingData || loading}
          >
            {loading ? "Procesando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Form3Modal1;