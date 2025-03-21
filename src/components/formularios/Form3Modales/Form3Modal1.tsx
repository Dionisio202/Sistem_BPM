import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import UploadFile from "../components/UploadFile";
import { SERVER_BACK_URL } from "../../../config.ts";
import { TipoProducto } from "../../../interfaces/registros.interface";
import { Facultad } from "../../../interfaces/facultades.interface.ts";
import InputField from "./components/InputField.tsx";
import Section from "./components/Section.tsx";
import SelectField from "./components/Selectfield.tsx";
import { ToastContainer, toast } from "react-toastify";
import Button from "../../UI/button.tsx";
interface ModalProps {
  showModal: boolean;
  closeModal: () => void;
  onSave: (productos: any[]) => void;
  initialData: any;
  id_registro: string;
}
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
    productos: any[]; // Lista de productos
    productoSeleccionado: string; // Nuevo campo para el producto seleccionado
    tipoMemorando: string;
  };
}

interface Rol {
  id: number;
  nombre: string;
}

const Form3Modal1: React.FC<ModalProps> = ({
  showModal,
  onSave,
  closeModal,
  id_registro,
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
      productos: [], // Lista de productos
      productoSeleccionado: "", // Producto seleccionado
      tipoMemorando: "",
    },
  });
  const [tiposProductos, setTiposProductos] = useState<TipoProducto[]>([]);
  const [facultadesCarreras, setFacultadesCarreras] = useState<Facultad[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facultadSeleccionada, setFacultadSeleccionada] = useState("");
  const [hasMissingData, setHasMissingData] = useState(false);
  const [intellectualPropertyFileBase64, setIntellectualPropertyFileBase64] =
    useState<string | null>(null);
  const [memoFileBase64, setMemoFileBase64] = useState<string | null>(null);

  //Cargar Codigo de Memorando
  useEffect(() => {
    if (editedData.productos.codigoMemorando) {
      console.log("Código actualizado:", editedData.productos.codigoMemorando);
    }
  }, [editedData.productos.codigoMemorando]);
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
              setEditedData((prev: any) => ({
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
            const parsedData = JSON.parse(response.data);
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

  // Cargar roles
  useEffect(() => {
    if (showModal) {
      socket.emit("obtener_rol", (response: any) => {
        if (response.success && response.data && response.data.length > 0) {
          try {
            setRoles(response.data);
          } catch (parseError) {
            console.error("Error al parsear roles:", parseError);
            setError("Error al cargar roles");
          }
        } else {
          console.error("Error al obtener roles:", response.message);
          setError("Error al cargar roles");
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
      const base64 = await convertFileToBase64(file);
      setMemoFileBase64(base64);
      toast.success("Memorando cargado correctamente");
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      toast.error("Error al cargar el memorando");
    }
  }, []);
  const handleTipoMemorandoChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const tipoSeleccionado = tiposProductos.find(
        (tipo) => tipo.id.toString() === e.target.value
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
    },
    [tiposProductos]
  );

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

  const validateForm = (): boolean => {
    const requiredFields = [
      "productos.codigoMemorando",
      "productos.lugar",
      "productos.destinatario.nombre",
      "productos.destinatario.titulo",
      "productos.destinatario.cargo",
      "productos.destinatario.institucion",
      "productos.solicitante.nombre",
      "productos.solicitante.cargo", // Combobox
      "productos.solicitante.facultad", // Combobox
      "productos.proyecto.tipo",
      "productos.proyecto.titulo",
      "productos.proyecto.resolucion.numero",
      "productos.proyecto.resolucion.fecha",
      "productos.tipoMemorando", // Combobox
      "productos.productoSeleccionado", // Combobox
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

    if (missingFields.length > 0) {
      toast.error(
        "Por favor complete todos los campos requeridos"
      );
      return false;
    }

    // Validar que los combobox tengan opciones válidas
    if (
      !tiposProductos.some(
        (tipo) => tipo.id.toString() === editedData.productos.tipoMemorando
      )
    ) {
      toast.error("Seleccione un tipo de registro válido.");
      return false;
    }

    if (
      !roles.some(
        (rol) => rol.id.toString() === editedData.productos.solicitante.cargo
      )
    ) {
      toast.error("Seleccione un cargo válido para el solicitante.");
      return false;
    }

    if (
      !facultadesCarreras.some(
        (facultad) =>
          facultad.id_facultad.toString() ===
          editedData.productos.solicitante.facultad
      )
    ) {
      toast.error("Seleccione una facultad válida.");
      return false;
    }

    if (
      !editedData.productos.productos.some(
        (producto: any) =>
          producto.nombre === editedData.productos.productoSeleccionado
      )
    ) {
      toast.error("Seleccione un producto válido.");
      return false;
    }
    return true;
  };

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

  const handleLoad = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try {
        setLoading(true);

        const timeout = setTimeout(() => {
          setLoading(false);
          toast.error("El servidor no respondió a tiempo. Inténtalo de nuevo.");
        }, 30000);

        socket.emit(
          "cargar_documento_producto",
          {
            documento_productos: intellectualPropertyFileBase64,
            documento_memorando: memoFileBase64,
            id_registro: id_registro,
          },
          (response: any) => {
            clearTimeout(timeout);
            setLoading(false);

            if (response?.success) {
              setEditedData((prev) => ({
                ...prev,
                productos: {
                  ...prev.productos,
                  codigoMemorando: response.data.codigo, // Actualización específica
                  ...response.data,
                },
              }));
            } else {
              const errorMessage =
                response?.error || response?.message || "Error desconocido";
              console.error("Error del servidor:", errorMessage);
              toast.error(errorMessage);
            }
          }
        );
      } catch (error) {
        setLoading(false);
        console.error("Error al guardar:", error);
        toast.error("Error al procesar los documentos");
      }
    },
    [intellectualPropertyFileBase64, memoFileBase64]
  );

  const handleSave = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    //@ts-ignore
    onSave(editedData.productos);
    closeModal();
  }, [editedData, onSave, closeModal]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-white/40 flex justify-center items-center p-4">
      <div className="bg-amber-50 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
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
                  onClick={handleLoad}
                  disabled={loading || !intellectualPropertyFileBase64}
                >
                  {loading ? "Procesando..." : "Cargar"}
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
                value={editedData.productos.tipoMemorando}
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
                onChange={(e) =>
                  handleChange("productos.lugar", e.target.value)
                }
              />
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
                  options={roles.map((rol) => ({
                    value: rol.id.toString(),
                    label: rol.nombre,
                  }))}
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
                <SelectField
                  label="Seleccione un producto"
                  value={editedData.productos.productoSeleccionado || ""} // Valor seleccionado
                  onChange={(e) =>
                    handleChange(
                      "productos.productoSeleccionado",
                      e.target.value
                    )
                  }
                  options={
                    // Opciones del combobox (todos los nombres de productos)
                    editedData.productos.productos.map((producto: any) => ({
                      value: producto.nombre, // Valor de la opción
                      label: producto.nombre, // Texto mostrado en la opción
                      indicador: producto.indicador, // Indicador de estado
                    }))
                  }
                />
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
                    handleChange(
                      "productos.proyecto.resolucion.numero",
                      e.target.value
                    )
                  }
                />
                <InputField
                  label="Resolución Fecha"
                  value={editedData.productos.proyecto.resolucion.fecha}
                  onChange={(e) =>
                    handleChange(
                      "productos.proyecto.resolucion.fecha",
                      e.target.value
                    )
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
          {/*Boton de Guardado*/}
          <button
            onClick={handleSave}
            className="bg-[#931D21] text-white text-xs sm:text-sm px-4 py-2 rounded-lg hover:bg-red-700"
            disabled={loading || hasMissingData}
          >
            {loading ? "Procesando..." : "Guardar Cambios"}
          </button>
          {}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Form3Modal1;
